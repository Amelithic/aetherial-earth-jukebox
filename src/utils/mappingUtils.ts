const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]
const PENTATONIC_MAJOR = [0, 2, 4, 7, 9]
const PENTATONIC_MINOR = [0, 3, 5, 7, 10]
const BLUES_SCALE = [0, 3, 5, 6, 7, 10]

const SCALE_PRESETS = {
  major: MAJOR_SCALE,
  minor: MINOR_SCALE,
  pentatonicMajor: PENTATONIC_MAJOR,
  pentatonicMinor: PENTATONIC_MINOR,
  blues: BLUES_SCALE,
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

export function rgbToHue(red: number, green: number, blue: number): number {
  const r = red / 255
  const g = green / 255
  const b = blue / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (delta === 0) return 0

  let hue: number
  if (max === r) {
    hue = ((g - b) / delta) % 6
  } else if (max === g) {
    hue = (b - r) / delta + 2
  } else {
    hue = (r - g) / delta + 4
  }

  return (hue * 60 + 360) % 360
}

export function getScaleSemitones(scale: keyof typeof SCALE_PRESETS): number[] {
  return SCALE_PRESETS[scale]
}

export function brightnessToScaleDegree(brightness: number, scale: keyof typeof SCALE_PRESETS): number {
  const semitones = getScaleSemitones(scale)
  const index = Math.min(
    semitones.length - 1,
    Math.floor(clamp(brightness) * semitones.length),
  )
  return semitones[index]
}

export function brightnessToFrequency(brightness: number, hue = 0, scale: keyof typeof SCALE_PRESETS = 'major'): number {
  const degree = brightnessToScaleDegree(brightness, scale)
  const hueOffset = Math.round((hue / 360) * 3)
  const semitones = degree + hueOffset
  return 110 * Math.pow(2, semitones / 12)
}
