import { ref } from 'vue'
import type { ImageSlice } from '@/utils/imageUtils'
import { sampleImageColumns } from '@/utils/imageUtils'

export function useImageProcessor() {
  const slices = ref<ImageSlice[]>([])
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  async function processImage(src: string, columns = 160): Promise<ImageSlice[]> {
    isProcessing.value = true
    error.value = null

    try {
      const result = await sampleImageColumns(src, columns)
      slices.value = result
      return result
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to process image.'
      throw cause
    } finally {
      isProcessing.value = false
    }
  }

  return { slices, isProcessing, error, processImage }
}
