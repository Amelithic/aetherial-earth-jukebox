function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i))
  }
}

export function encodeWav(buffer: AudioBuffer): Blob {
  const channelCount = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const frameCount = buffer.length
  const bytesPerSample = 2
  const blockAlign = channelCount * bytesPerSample
  const dataSize = frameCount * blockAlign
  const headerSize = 44
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, headerSize - 8 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channelCount, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  const channels: Float32Array[] = []
  for (let channel = 0; channel < channelCount; channel++) {
    channels.push(buffer.getChannelData(channel))
  }

  let offset = headerSize
  for (let frame = 0; frame < frameCount; frame++) {
    for (let channel = 0; channel < channelCount; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += bytesPerSample
    }
  }

  return new Blob([view], { type: 'audio/wav' })
}

function pushVarLen(bytes: number[], value: number): void {
  let v = value & 0x7fffffff
  const stack: number[] = []
  stack.push(v & 0x7f)
  while ((v >>= 7)) stack.push((v & 0x7f) | 0x80)
  for (let i = stack.length - 1; i >= 0; i--) bytes.push(stack[i])
}

function pushU16(bytes: number[], value: number): void {
  bytes.push((value >> 8) & 0xff, value & 0xff)
}

function pushU32(bytes: number[], value: number): void {
  bytes.push((value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff)
}

export interface MidiNoteEvent {
  time: number
  duration: number
  midi: number
  velocity?: number
}

export function encodeMidi(events: MidiNoteEvent[], ticksPerQuarter = 480, bpm = 120): Blob {
  const ticksPerSecond = (ticksPerQuarter * bpm) / 60
  const track: number[] = []

  pushU16(track, 0)
  track.push(0xff, 0x51, 0x03)
  const mpqn = Math.round(60000000 / bpm)
  track.push((mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff)

  type Timed = { tick: number; on: boolean; midi: number; velocity: number }
  const timed: Timed[] = []
  for (const e of events) {
    const startTick = Math.max(0, Math.round(e.time * ticksPerSecond))
    const endTick = Math.max(startTick + 1, Math.round((e.time + e.duration) * ticksPerSecond))
    const midi = Math.max(0, Math.min(127, Math.round(e.midi)))
    const velocity = Math.max(1, Math.min(127, Math.round(e.velocity ?? 90)))
    timed.push({ tick: startTick, on: true, midi, velocity })
    timed.push({ tick: endTick, on: false, midi, velocity: 0 })
  }
  timed.sort((a, b) => a.tick - b.tick || (a.on ? 1 : -1))

  let lastTick = 0
  for (const e of timed) {
    const delta = e.tick - lastTick
    lastTick = e.tick
    pushVarLen(track, delta)
    track.push(e.on ? 0x90 : 0x80, e.midi, e.velocity)
  }

  pushVarLen(track, 0)
  track.push(0xff, 0x2f, 0x00)

  const bytes: number[] = []
  bytes.push(0x4d, 0x54, 0x68, 0x64)
  pushU32(bytes, 6)
  pushU16(bytes, 0)
  pushU16(bytes, 1)
  pushU16(bytes, ticksPerQuarter)
  bytes.push(0x4d, 0x54, 0x72, 0x6b)
  pushU32(bytes, track.length)
  bytes.push(...track)

  return new Blob([new Uint8Array(bytes)], { type: 'audio/midi' })
}
