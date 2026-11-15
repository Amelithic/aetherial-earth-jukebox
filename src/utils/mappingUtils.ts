const SCALE_SEMITONES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]

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

export function brightnessToFrequency(brightness: number, hue = 0): number {
  const index = Math.min(
    SCALE_SEMITONES.length - 1,
    Math.floor(clamp(brightness) * SCALE_SEMITONES.length),
  )
  const hueOffset = Math.round((hue / 360) * 4)
  const semitones = SCALE_SEMITONES[index] + hueOffset
  return 110 * Math.pow(2, semitones / 12)
}
