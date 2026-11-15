<script setup lang="ts">
defineProps<{
  speed: number
  isPlaying: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
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
  <div class="sonification-controls card stack">
    <div class="sonification-controls__row">
      <button class="button" type="button" :disabled="disabled" @click="emit('toggle')">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button class="button" type="button" :disabled="disabled" @click="resetSpeed">
        1x
      </button>
      <span class="muted">{{ speed.toFixed(2) }}x</span>
    </div>

    <label class="sonification-controls__speed">
      <span>Playback speed</span>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.05"
        :value="speed"
        @input="onSpeedInput"
      />
    </label>
  </div>
</template>
