import { rgbToHue } from './mappingUtils'

export interface ImageSlice {
  red: number
  green: number
  blue: number
  brightness: number
  hue: number
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load image.'))
    image.src = src
  })
}

function isNearBlackOrWhite(r: number, g: number, b: number, threshold = 40): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const chroma = max - min

  const nearBlack = max < threshold
  const nearWhite = min > 255 - threshold

  return (nearBlack || nearWhite) && chroma < threshold
}

export async function sampleImageColumns(
  src: string,
  columns = 160,
  excludeBackground = false,
  backgroundThreshold = 40,
): Promise<ImageSlice[]> {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('2D canvas context is unavailable.')

  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const columnCount = Math.max(1, Math.min(columns, canvas.width))
  const columnWidth = canvas.width / columnCount
  const candidates: ImageSlice[] = []
  const slices: ImageSlice[] = []

  for (let column = 0; column < columnCount; column++) {
    const startX = Math.floor(column * columnWidth)
    const endX = Math.max(startX + 1, Math.floor((column + 1) * columnWidth))

    let red = 0
    let green = 0
    let blue = 0
    let count = 0

    for (let x = startX; x < endX; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const index = (y * canvas.width + x) * 4
        red += pixels[index]
        green += pixels[index + 1]
        blue += pixels[index + 2]
        count++
      }
    }

    if (count === 0) continue

    red /= count
    green /= count
    blue /= count

    const slice: ImageSlice = {
      red,
      green,
      blue,
      brightness: (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255,
      hue: rgbToHue(red, green, blue),
    }

    candidates.push(slice)

    if (!excludeBackground || !isNearBlackOrWhite(red, green, blue, backgroundThreshold)) {
      slices.push(slice)
    }
  }

  if (slices.length > 0) return slices
  if (candidates.length > 0) return candidates

  return [{ red: 128, green: 128, blue: 128, brightness: 0.5, hue: 0 }]
}
