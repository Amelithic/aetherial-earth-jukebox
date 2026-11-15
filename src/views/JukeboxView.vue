<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhCaretDown,
  PhCaretUp,
  PhFileAudio,
  PhFilmStrip,
  PhMusicNotes,
  PhPause,
  PhPlay,
  PhShareNetwork,
  PhSkipBack,
  PhSkipForward,
  PhUploadSimple,
  PhX,
} from '@phosphor-icons/vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import SonificationControls from '@/components/SonificationControls.vue'
import Visualiser from '@/components/Visualiser.vue'
import JukeboxNav from '@/jukebox/components/JukeboxNav.vue'
import ProcessingOverlay from '@/jukebox/components/ProcessingOverlay.vue'
import jukeboxBlank from '@/assets/images/JukeboxBlank.png'
import volumeDial from '@/assets/images/VolumeDial.png'
import { getDatasetById, getNextDataset, getPreviousDataset } from '@/assets/data/datasets'
import { useAudioEngine } from '@/composables/useAudioEngine'
import { useImageProcessor } from '@/composables/useImageProcessor'
import { useSonification } from '@/composables/useSonification'

const route = useRoute()
const router = useRouter()

const {
  audioEl,
  isPlaying,
  currentTime,
  duration,
  volume,
  toggle,
  seek,
  setRate,
  setVolume,
  pause,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onEnded,
} = useAudioEngine()

const { processImage } = useImageProcessor()
const { renderToBuffer, bufferToWav } = useSonification()

const currentDataset = computed(() => getDatasetById(route.params.id as string | undefined))
const customImage = ref<string | null>(null)
const activeImage = computed(() => customImage.value ?? currentDataset.value.image)
const currentTitle = computed(() =>
  customImage.value ? 'Custom image' : currentDataset.value.name,
)

const status = ref<'idle' | 'processing' | 'ready' | 'error'>('idle')
const errorMessage = ref('')
const shareMessage = ref('')
const speed = ref(1)
const audioUrl = ref('')
const showControls = ref(true)
const showUpload = ref(false)
const downloadName = computed(() =>
  customImage.value ? 'custom-image.wav' : `${currentDataset.value.id}.wav`,
)

const volumePercent = computed(() => Math.round(volume.value * 100))
const knobAngle = computed(() => -135 + volumePercent.value * 2.7)

let runToken = 0

async function processCurrentImage(): Promise<void> {
  const token = ++runToken
  status.value = 'processing'
  errorMessage.value = ''
  shareMessage.value = ''
  pause()

  try {
    const slices = await processImage(activeImage.value, 160)
    const buffer = await renderToBuffer(slices, { secondsPerSlice: 0.08 })
    if (token !== runToken) return

    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = URL.createObjectURL(bufferToWav(buffer))
    status.value = 'ready'
  } catch (cause) {
    if (token !== runToken) return
    status.value = 'error'
    errorMessage.value = cause instanceof Error ? cause.message : 'Unable to process image.'
  }
}

watch(
  [() => currentDataset.value.id, () => customImage.value],
  () => {
    void processCurrentImage()
  },
  { immediate: true },
)

watch(speed, (value) => setRate(value))

function onFileSelected(file: File): void {
  if (customImage.value) URL.revokeObjectURL(customImage.value)
  customImage.value = URL.createObjectURL(file)
  showUpload.value = false
}

function navigateToDataset(id: string): void {
  if (id === currentDataset.value.id) return

  customImage.value = null
  void router.push({ name: 'jukebox-track', params: { id } })
}

function goToNextDataset(): void {
  navigateToDataset(getNextDataset(currentDataset.value.id).id)
}

function goToPreviousDataset(): void {
  navigateToDataset(getPreviousDataset(currentDataset.value.id).id)
}

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value))
}

const knobDrag = ref<{ startY: number; startVolume: number } | null>(null)

function onKnobPointerDown(event: PointerEvent): void {
  knobDrag.value = { startY: event.clientY, startVolume: volume.value }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onKnobPointerMove(event: PointerEvent): void {
  if (!knobDrag.value) return

  const delta = (knobDrag.value.startY - event.clientY) / 140
  setVolume(clampVolume(knobDrag.value.startVolume + delta))
}

function onKnobPointerUp(event: PointerEvent): void {
  knobDrag.value = null
  const element = event.currentTarget as HTMLElement

  if (element.hasPointerCapture(event.pointerId)) {
    element.releasePointerCapture(event.pointerId)
  }
}

function onKnobWheel(event: WheelEvent): void {
  setVolume(clampVolume(volume.value + (event.deltaY < 0 ? 0.05 : -0.05)))
}

function onKnobKeydown(event: KeyboardEvent): void {
  const step = event.shiftKey ? 0.1 : 0.05
  let next: number | null = null

  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowRight':
      next = volume.value + step
      break
    case 'ArrowDown':
    case 'ArrowLeft':
      next = volume.value - step
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = 1
      break
  }

  if (next !== null) {
    event.preventDefault()
    setVolume(clampVolume(next))
  }
}

async function share(): Promise<void> {
  const url = window.location.href

  try {
    if (navigator.share) {
      await navigator.share({ title: currentTitle.value, url })
      shareMessage.value = 'Shared!'
    } else {
      await navigator.clipboard.writeText(url)
      shareMessage.value = 'Link copied!'
    }
  } catch {
    shareMessage.value = 'Share cancelled.'
  }
}

onBeforeUnmount(() => {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  if (customImage.value) URL.revokeObjectURL(customImage.value)
})
</script>

<template>
  <div class="jukebox-page">
    <div class="jukebox-page__bg" :style="{ backgroundImage: `url(${activeImage})` }"></div>
    <div class="jukebox-page__tint"></div>

    <div class="jukebox-shell">
      <header class="jukebox-topbar">
        <JukeboxNav :show-browse="true" />

        <div class="now-playing">
          <span
            class="now-playing__disc"
            :class="{ 'is-spinning': isPlaying }"
            :style="{ backgroundImage: `url(${activeImage})` }"
            aria-hidden="true"
          ></span>
          <div>
            <p class="now-playing__label">Now playing</p>
            <p class="now-playing__name">{{ currentTitle }}</p>
          </div>
        </div>
      </header>

      <main class="jukebox-stage">
        <div class="jukebox-cabinet">
          <img
            class="jukebox-cabinet__base"
            :src="jukeboxBlank"
            alt="Retro jukebox cabinet"
            draggable="false"
          />

          <div class="jukebox-cabinet__screen">
            <Visualiser :texture-url="activeImage" />
          </div>

          <p class="jukebox-cabinet__track">{{ currentTitle }}</p>

          <div
            class="jukebox-knob"
            role="slider"
            tabindex="0"
            aria-label="Volume"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="volumePercent"
            :aria-valuetext="`Volume ${volumePercent}%`"
            @pointerdown="onKnobPointerDown"
            @pointermove="onKnobPointerMove"
            @pointerup="onKnobPointerUp"
            @pointercancel="onKnobPointerUp"
            @wheel.prevent="onKnobWheel"
            @keydown="onKnobKeydown"
          >
            <span class="jukebox-knob__value">VOL {{ volumePercent }}%</span>
            <img
              :src="volumeDial"
              alt=""
              draggable="false"
              :style="{ transform: `rotate(${knobAngle}deg)` }"
            />
          </div>

          <div class="jukebox-transport">
            <button
              class="jukebox-transport__skip"
              type="button"
              title="Previous track"
              aria-label="Previous track"
              @click="goToPreviousDataset"
            >
              <PhSkipBack :size="16" weight="fill" />
            </button>

            <button
              class="jukebox-transport__play"
              type="button"
              :disabled="status !== 'ready' || !audioUrl"
              :aria-label="isPlaying ? 'Pause' : 'Play'"
              @click="toggle"
            >
              <PhPause v-if="isPlaying" :size="24" weight="fill" />
              <PhPlay v-else :size="24" weight="fill" />
            </button>

            <button
              class="jukebox-transport__skip"
              type="button"
              title="Next track"
              aria-label="Next track"
              @click="goToNextDataset"
            >
              <PhSkipForward :size="16" weight="fill" />
            </button>
          </div>
        </div>
      </main>

      <aside class="jukebox-rack" aria-label="Download, share, and upload">
        <a
          v-if="audioUrl"
          class="jukebox-rack__button"
          :href="audioUrl"
          :download="downloadName"
          title="Download WAV"
          aria-label="Download WAV"
          data-label="Download WAV"
        >
          <PhFileAudio :size="21" weight="fill" />
        </a>
        <button
          v-else
          class="jukebox-rack__button"
          type="button"
          disabled
          title="Download WAV"
          aria-label="Download WAV"
          data-label="Download WAV"
        >
          <PhFileAudio :size="21" weight="fill" />
        </button>

        <button
          class="jukebox-rack__button"
          type="button"
          disabled
          title="MP4 export coming soon"
          aria-label="MP4 export coming soon"
          data-label="MP4 coming soon"
        >
          <PhFilmStrip :size="21" weight="fill" />
        </button>

        <button
          class="jukebox-rack__button"
          type="button"
          disabled
          title="MIDI export coming soon"
          aria-label="MIDI export coming soon"
          data-label="MIDI coming soon"
        >
          <PhMusicNotes :size="21" weight="fill" />
        </button>

        <button
          class="jukebox-rack__button"
          type="button"
          title="Share this record"
          aria-label="Share this record"
          data-label="Share"
          @click="share"
        >
          <PhShareNetwork :size="21" weight="fill" />
        </button>

        <span class="jukebox-rack__divider" aria-hidden="true"></span>

        <button
          class="jukebox-rack__button"
          type="button"
          title="Upload your own image"
          aria-label="Upload your own image"
          data-label="Upload image"
          @click="showUpload = true"
        >
          <PhUploadSimple :size="21" weight="bold" />
        </button>

        <p v-if="shareMessage" class="share-message">{{ shareMessage }}</p>
      </aside>

      <div class="jukebox-bottom">
        <div v-if="showControls" class="jukebox-controls">
          <AudioPlayer
            :is-playing="isPlaying"
            :current-time="currentTime"
            :duration="duration"
            :volume="volume"
            :disabled="status !== 'ready' || !audioUrl"
            @toggle="toggle"
            @seek="seek"
            @previous="goToPreviousDataset"
            @next="goToNextDataset"
            @update:volume="setVolume"
          />

          <SonificationControls
            :speed="speed"
            :disabled="status !== 'ready'"
            @update:speed="speed = $event"
          />

          <button
            class="icon-button jukebox-controls__hide"
            type="button"
            title="Hide controls"
            aria-label="Hide controls"
            @click="showControls = false"
          >
            <PhCaretDown :size="16" weight="bold" />
          </button>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>

        <button
          v-else
          class="button button--ghost jukebox-controls__show"
          type="button"
          @click="showControls = true"
        >
          <PhCaretUp :size="15" weight="bold" />
          Show controls
        </button>
      </div>
    </div>

    <audio
      ref="audioEl"
      :src="audioUrl"
      preload="auto"
      hidden
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
    ></audio>

    <ProcessingOverlay :visible="status === 'processing'" />

    <Transition name="upload-fade">
      <div v-if="showUpload" class="upload-overlay" @click.self="showUpload = false">
        <section
          class="upload-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-title"
        >
          <button
            class="icon-button upload-panel__close"
            type="button"
            title="Close upload dialog"
            aria-label="Close upload dialog"
            @click="showUpload = false"
          >
            <PhX :size="16" weight="bold" />
          </button>

          <p class="eyebrow">Custom image</p>
          <h2 id="upload-title">Sonify your own image</h2>
          <p class="muted">
            Pick an Earth image or any picture. We will turn its colours into a playable track.
          </p>

          <ImageUploader @select="onFileSelected" />

          <p class="upload-panel__note muted">Your image stays in this browser.</p>
        </section>
      </div>
    </Transition>
  </div>
</template>
