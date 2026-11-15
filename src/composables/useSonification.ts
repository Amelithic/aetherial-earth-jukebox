import type { ImageSlice } from '@/utils/imageUtils'
import { brightnessToFrequency, brightnessToScaleDegree } from '@/utils/mappingUtils'
import { encodeWav } from '@/utils/audioUtils'

export interface SonificationOptions {
  secondsPerSlice?: number
  sampleRate?: number
  volume?: number
  waveform?: string
  mode?: 'single' | 'chord' | 'arpeggio'
  scale?: keyof typeof SCALE_PRESETS
  octaveShift?: number
  reverb?: boolean
}

const SCALE_PRESETS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
}

const FALLBACK_SLICE: ImageSlice = {
  red: 128,
  green: 128,
  blue: 128,
  brightness: 0.5,
  hue: 0,
}

export function useSonification() {
  async function renderToBuffer(
    slices: ImageSlice[],
    options: SonificationOptions = {},
  ): Promise<AudioBuffer> {
    const sourceSlices = slices.length > 0 ? slices : [FALLBACK_SLICE]

    const secondsPerSlice = options.secondsPerSlice ?? 0.08
    const sampleRate = options.sampleRate ?? 44100
    const volume = options.volume ?? 0.35
    const waveform = options.waveform ?? 'triangle'
    const mode = options.mode ?? 'single'
    const scale = options.scale ?? 'major'
    const octaveShift = options.octaveShift ?? 1
    const reverb = options.reverb ?? false
    const duration = Math.max(0.1, sourceSlices.length * secondsPerSlice)

    const context = new OfflineAudioContext(1, Math.ceil(sampleRate * (duration + (reverb ? 1.5 : 0))), sampleRate)
    const master = context.createGain()
    master.gain.value = volume
    master.connect(context.destination)

    if (reverb) {
      const convolver = context.createConvolver()
      convolver.buffer = createReverbImpulse(context, 1.5, 2.5)
      const wetGain = context.createGain()
      wetGain.gain.value = 0.3
      master.connect(convolver)
      convolver.connect(wetGain)
      wetGain.connect(context.destination)
    }

    if (mode === 'chord') {
      renderChordMode(context, master, sourceSlices, secondsPerSlice, waveform, scale, octaveShift)
    } else if (mode === 'arpeggio') {
      renderArpeggioMode(context, master, sourceSlices, secondsPerSlice, waveform, scale, octaveShift)
    } else {
      renderSingleMode(context, master, sourceSlices, secondsPerSlice, waveform, scale, octaveShift)
    }
    return context.startRendering()
  }

  function renderSingleMode(
    context: OfflineAudioContext,
    master: GainNode,
    slices: ImageSlice[],
    secondsPerSlice: number,
    waveform: string,
    scale: keyof typeof SCALE_PRESETS,
    octaveShift: number,
  ) {
    slices.forEach((slice, index) => {
      const start = index * secondsPerSlice
      const end = start + secondsPerSlice * 0.95
      const oscillator = context.createOscillator()
      const envelope = context.createGain()

      const baseFreq = brightnessToFrequency(slice.brightness, slice.hue, scale)
      
      oscillator.type = waveform as OscillatorType
      oscillator.frequency.value = baseFreq * Math.pow(2, octaveShift)

      envelope.gain.setValueAtTime(0.0001, start)
      envelope.gain.exponentialRampToValueAtTime(1, start + 0.005)
      envelope.gain.exponentialRampToValueAtTime(0.0001, Math.max(start + 0.01, end))

      oscillator.connect(envelope)
      envelope.connect(master)
      oscillator.start(start)
      oscillator.stop(end + 0.01)
    })
  }

  function renderChordMode(
    context: OfflineAudioContext,
    master: GainNode,
    slices: ImageSlice[],
    secondsPerSlice: number,
    waveform: string,
    scale: keyof typeof SCALE_PRESETS,
    octaveShift: number,
  ): void {
    slices.forEach((slice, index) => {
      const start = index * secondsPerSlice
      const end = start + secondsPerSlice * 0.9
      const baseFreq = brightnessToFrequency(slice.brightness, slice.hue, scale) * Math.pow(2, octaveShift)
      
      const chordNotes = ['root', 'third', 'fifth'].map((note) => {
        const intervals: Record<string, number> = {
          root: 0,
          third: 4,
          fifth: 7,
        }
        return baseFreq * Math.pow(2, intervals[note] / 12)
      })

      const mixGain = context.createGain()
      chordNotes.forEach((freq) => {
        const noteOsc = context.createOscillator()
        noteOsc.type = waveform as OscillatorType
        noteOsc.frequency.value = freq
        noteOsc.connect(mixGain)
        noteOsc.start(start)
        noteOsc.stop(end)
      })

      const chordOsc = context.createOscillator()
      chordOsc.type = waveform as OscillatorType
      chordOsc.frequency.value = chordNotes[0]
      chordOsc.connect(mixGain)
      chordOsc.start(start)
      chordOsc.stop(end + 0.1)

      const envelope = context.createGain()
      envelope.gain.setValueAtTime(0.0001, start)
      envelope.gain.exponentialRampToValueAtTime(1, start + 0.005)
      envelope.gain.exponentialRampToValueAtTime(0.0001, Math.max(start + 0.1, end))

      mixGain.connect(envelope)
      envelope.connect(master)
    })
  }

  function renderArpeggioMode(
    context: OfflineAudioContext,
    master: GainNode,
    slices: ImageSlice[],
    secondsPerSlice: number,
    waveform: string,
    scale: keyof typeof SCALE_PRESETS,
    octaveShift: number,
  ) {
    slices.forEach((slice, index) => {
      const start = index * secondsPerSlice
      const noteDuration = secondsPerSlice * 0.8
      const end = start + noteDuration

      const degree = brightnessToScaleDegree(slice.brightness, scale)
      const semitones = degree + Math.round((slice.hue / 360) * 3)
      // Base frequency 110Hz (A2) scaled by octaveShift
      const frequency = (110 * Math.pow(2, octaveShift)) * Math.pow(2, semitones / 12)

      const oscillator = context.createOscillator()
      const envelope = context.createGain()

      oscillator.type = waveform as OscillatorType
      oscillator.frequency.value = frequency

      envelope.gain.setValueAtTime(0.001, start)
      envelope.gain.exponentialRampToValueAtTime(1, start + 0.01)
      envelope.gain.exponentialRampToValueAtTime(0.001, end)

      oscillator.connect(envelope)
      envelope.connect(master)
      oscillator.start(start)
      oscillator.stop(end + 0.01)
    })
  }

  function createReverbImpulse(context: OfflineAudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = context.sampleRate
    const length = Math.ceil(sampleRate * duration)
    const impulse = context.createBuffer(1, length, sampleRate)
    const data = impulse.getChannelData(0)

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }

    return impulse
  }

  function bufferToWav(buffer: AudioBuffer): Blob {
    return encodeWav(buffer)
  }

  return { renderToBuffer, bufferToWav }
}