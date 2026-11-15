import type { ImageSlice } from '@/utils/imageUtils'
import { brightnessToFrequency } from '@/utils/mappingUtils'
import { encodeWav } from '@/utils/audioUtils'

export interface SonificationOptions {
  secondsPerSlice?: number
  sampleRate?: number
  volume?: number
  waveform?: OscillatorType
}

export function useSonification() {
  async function renderToBuffer(
    slices: ImageSlice[],
    options: SonificationOptions = {},
  ): Promise<AudioBuffer> {
    if (slices.length === 0) throw new Error('There are no image slices to sonify.')

    const secondsPerSlice = options.secondsPerSlice ?? 0.08
    const sampleRate = options.sampleRate ?? 44100
    const volume = options.volume ?? 0.35
    const waveform = options.waveform ?? 'triangle'
    const duration = Math.max(0.1, slices.length * secondsPerSlice)

    const context = new OfflineAudioContext(1, Math.ceil(sampleRate * duration), sampleRate)
    const master = context.createGain()
    master.gain.value = volume
    master.connect(context.destination)

    slices.forEach((slice, index) => {
      const start = index * secondsPerSlice
      const end = start + secondsPerSlice * 0.95
      const oscillator = context.createOscillator()
      const envelope = context.createGain()

      oscillator.type = waveform
      oscillator.frequency.value = brightnessToFrequency(slice.brightness, slice.hue)

      envelope.gain.setValueAtTime(0.0001, start)
      envelope.gain.exponentialRampToValueAtTime(1, start + 0.005)
      envelope.gain.exponentialRampToValueAtTime(0.0001, Math.max(start + 0.01, end))

      oscillator.connect(envelope)
      envelope.connect(master)
      oscillator.start(start)
      oscillator.stop(end + 0.01)
    })

    return context.startRendering()
  }

  function bufferToWav(buffer: AudioBuffer): Blob {
    return encodeWav(buffer)
  }

  return { renderToBuffer, bufferToWav }
}
