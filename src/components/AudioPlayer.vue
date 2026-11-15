<script setup lang="ts">
import {
  PhPause,
  PhPlay,
  PhRepeat,
  PhSkipBack,
  PhSkipForward,
  PhSpeakerHigh,
  PhSpeakerLow,
  PhSpeakerX,
} from '@phosphor-icons/vue'
import { formatTime } from '@/composables/useAudioEngine'

defineProps<{
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  loop: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  seek: [time: number]
  previous: []
  next: []
  'update:loop': [value: boolean]
  'update:volume': [value: number]
}>()

function onSeek(event: Event): void {
  emit('seek', Number((event.target as HTMLInputElement).value))
}

function onVolume(event: Event): void {
  emit('update:volume', Number((event.target as HTMLInputElement).value) / 100)
}
</script>

<template>
  <div class="audio-player">
    <div class="audio-player__transport">
      <button
        class="audio-player__skip"
        type="button"
        title="Previous track"
        aria-label="Previous track"
        @click="emit('previous')"
      >
        <PhSkipBack :size="17" weight="fill" />
      </button>

      <button
        class="audio-player__play"
        type="button"
        :disabled="disabled"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        @click="emit('toggle')"
      >
        <PhPause v-if="isPlaying" :size="20" weight="fill" />
        <PhPlay v-else :size="20" weight="fill" />
      </button>

      <button
        class="audio-player__skip"
        type="button"
        title="Next track"
        aria-label="Next track"
        @click="emit('next')"
      >
        <PhSkipForward :size="17" weight="fill" />
      </button>

      <button
        class="audio-player__loop"
        :class="{ 'is-active': loop }"
        type="button"
        :title="loop ? 'Disable loop' : 'Loop track'"
        :aria-label="loop ? 'Disable loop' : 'Loop track'"
        :aria-pressed="loop"
        @click="emit('update:loop', !loop)"
      >
        <PhRepeat :size="16" weight="bold" />
      </button>
    </div>

    <div class="audio-player__timeline">
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

      <span class="audio-player__time">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>
    </div>

    <label class="audio-player__volume" title="Volume">
      <PhSpeakerHigh v-if="volume > 0.5" :size="16" weight="fill" />
      <PhSpeakerLow v-else-if="volume > 0" :size="16" weight="fill" />
      <PhSpeakerX v-else :size="16" weight="fill" />
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        :value="Math.round(volume * 100)"
        aria-label="Volume"
        @input="onVolume"
      />
    </label>
  </div>
</template>
