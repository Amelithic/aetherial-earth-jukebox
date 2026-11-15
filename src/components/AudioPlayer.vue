<script setup lang="ts">
import { formatTime } from '@/composables/useAudioEngine'

defineProps<{
  isPlaying: boolean
  currentTime: number
  duration: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  seek: [time: number]
}>()

function onSeek(event: Event): void {
  emit('seek', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="audio-player">
    <button class="button" type="button" :disabled="disabled" @click="emit('toggle')">
      {{ isPlaying ? 'Pause' : 'Play' }}
    </button>

    <input
      class="audio-player__range"
      type="range"
      min="0"
      :max="Math.max(duration, 0.01)"
      step="0.01"
      :value="currentTime"
      :disabled="disabled"
      aria-label="Seek within track"
      @input="onSeek"
    />

    <span class="audio-player__time muted">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </span>
  </div>
</template>
