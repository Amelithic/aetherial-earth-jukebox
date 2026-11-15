<script setup lang="ts">
const emit = defineEmits<{ select: [file: File] }>()

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) emit('select', file)
  input.value = ''
}
</script>

<template>
  <label class="image-uploader">
    <span class="image-uploader__label">Upload image</span>
    <input type="file" accept="image/*" @change="onChange" />
  </label>
</template>
