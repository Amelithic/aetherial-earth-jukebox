<script setup lang="ts">
defineProps<{
  speed: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:speed': [value: number]
}>()

function onSpeedInput(event: Event): void {
  emit('update:speed', Number((event.target as HTMLInputElement).value))
}

function resetSpeed(): void {
  emit('update:speed', 1)
}
</script>

<template>
  <div class="sonification-controls">
    <label class="sonification-controls__speed">
      <span>Speed {{ speed.toFixed(2) }}x</span>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.05"
        :value="speed"
        :disabled="disabled"
        aria-label="Playback speed"
        @input="onSpeedInput"
      />
    </label>

    <button
      class="button button--ghost"
      type="button"
      :disabled="disabled"
      @click="resetSpeed"
    >
      1x
    </button>
  </div>
</template>
