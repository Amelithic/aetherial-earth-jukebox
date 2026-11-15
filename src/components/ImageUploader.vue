<script setup lang="ts">
import { ref } from 'vue'
import { PhUploadSimple } from '@phosphor-icons/vue'

const emit = defineEmits<{ select: [file: File] }>()
const isDragging = ref(false)

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) emit('select', file)
  input.value = ''
}

function onDrop(event: DragEvent): void {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) emit('select', file)
}
</script>

<template>
  <label
    class="image-uploader"
    :class="{ 'is-dragging': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <span class="image-uploader__icon" aria-hidden="true">
      <PhUploadSimple :size="30" weight="bold" />
    </span>
    <span class="image-uploader__title">Choose an image</span>
    <span class="image-uploader__hint">Drag and drop a PNG, JPG, or WEBP</span>
    <input class="sr-only" type="file" accept="image/*" @change="onChange" />
  </label>
</template>
