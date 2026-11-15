<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AudioPlayer from '@/components/AudioPlayer.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import SonificationControls from '@/components/SonificationControls.vue'
import Visualiser from '@/components/Visualiser.vue'
import JukeboxNav from '@/jukebox/components/JukeboxNav.vue'
import ProcessingOverlay from '@/jukebox/components/ProcessingOverlay.vue'
import jukeboxBlank from '@/assets/images/JukeboxBlank.png'
import volumeDial from '@/assets/images/VolumeDial.png'
import { getDatasetById, getNextDataset } from '@/assets/data/datasets'
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
  toggle,
  seek,
  setRate,
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

const status = ref<'idle' | 'processing' | 'ready' | 'error'>('idle')
const errorMessage = ref('')
const shareMessage = ref('')
const speed = ref(1)
const audioUrl = ref('')
const showControls = ref(true)
const downloadName = computed(() => `${currentDataset.value.id}.wav`)

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
}

function goToNextDataset(): void {
  const next = getNextDataset(currentDataset.value.id)
  if (next.id === currentDataset.value.id) return

  customImage.value = null
  void router.push({ name: 'jukebox-track', params: { id: next.id } })
}

async function share(): Promise<void> {
  const url = window.location.href

  try {
    if (navigator.share) {
      await navigator.share({ title: currentDataset.value.name, url })
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
            <p class="now-playing__name">{{ currentDataset.name }}</p>
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

          <p class="jukebox-cabinet__track">{{ currentDataset.name }}</p>

          <button
            class="jukebox-knob"
            type="button"
            title="Load the next record"
            aria-label="Load the next record"
            :disabled="status === 'processing'"
            @click="goToNextDataset"
          >
            <img :src="volumeDial" alt="" draggable="false" />
          </button>

          <button
            class="jukebox-play"
            type="button"
            :disabled="status !== 'ready' || !audioUrl"
            :aria-label="isPlaying ? 'Pause' : 'Play'"
            @click="toggle"
          >
            <span v-if="isPlaying" class="pause-icon" aria-hidden="true">
              <i></i>
              <i></i>
            </span>
            <span v-else class="play-icon" aria-hidden="true"></span>
          </button>
        </div>

        <aside class="jukebox-downloads" aria-label="Download and share">
          <a
            v-if="audioUrl"
            class="jukebox-download"
            :href="audioUrl"
            :download="downloadName"
            title="Download WAV"
          >
            WAV
          </a>
          <button v-else class="jukebox-download" type="button" disabled title="Download WAV">
            WAV
          </button>

          <button class="jukebox-download" type="button" disabled title="MP4 export coming soon">
            MP4
          </button>
          <button class="jukebox-download" type="button" disabled title="MIDI export coming soon">
            MIDI
          </button>

          <button
            class="jukebox-download"
            type="button"
            title="Share this record"
            aria-label="Share this record"
            @click="share"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
              <path d="M5 5h6V3H3v18h18v-8h-2v6H5V5z" />
            </svg>
          </button>

          <p v-if="shareMessage" class="share-message">{{ shareMessage }}</p>
        </aside>
      </main>

      <div class="jukebox-bottom">
        <div v-if="showControls" class="jukebox-controls">
          <AudioPlayer
            :is-playing="isPlaying"
            :current-time="currentTime"
            :duration="duration"
            :disabled="status !== 'ready' || !audioUrl"
            @toggle="toggle"
            @seek="seek"
          />

          <SonificationControls
            :speed="speed"
            :disabled="status !== 'ready'"
            @update:speed="speed = $event"
          />

          <ImageUploader @select="onFileSelected" />

          <button
            class="button button--ghost jukebox-controls__hide"
            type="button"
            @click="showControls = false"
          >
            Hide
          </button>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>

        <button
          v-else
          class="button button--ghost"
          type="button"
          @click="showControls = true"
        >
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
  </div>
</template>
