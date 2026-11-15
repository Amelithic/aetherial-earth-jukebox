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
  <label class="image-uploader card stack">
    <span>Sonify your own image (optional)</span>
    <input type="file" accept="image/*" @change="onChange" />
  </label>
</template>
