<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AudioPlayer from '@/components/AudioPlayer.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import SonificationControls from '@/components/SonificationControls.vue'
import Visualiser from '@/components/Visualiser.vue'
import JukeboxNav from '@/jukebox/components/JukeboxNav.vue'
import ProcessingOverlay from '@/jukebox/components/ProcessingOverlay.vue'
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
  <div class="jukebox-page" :style="{ backgroundImage: `url(${activeImage})` }">
    <div class="jukebox-page__scrim">
      <JukeboxNav />

      <main class="container jukebox-layout">
        <section class="jukebox-cabinet">
          <div class="jukebox-cabinet__top">
            <span class="muted">Now playing</span>
            <div
              class="jukebox-cabinet__record"
              :style="{ backgroundImage: `url(${activeImage})` }"
              aria-hidden="true"
            >
              <span class="jukebox-cabinet__hole"></span>
            </div>
          </div>

          <Visualiser :texture-url="activeImage" />

          <p class="jukebox-cabinet__track">{{ currentDataset.name }}</p>

          <AudioPlayer
            :is-playing="isPlaying"
            :current-time="currentTime"
            :duration="duration"
            :disabled="status !== 'ready' || !audioUrl"
            @toggle="toggle"
            @seek="seek"
          />

          <button
            class="button"
            type="button"
            :disabled="status === 'processing'"
            @click="goToNextDataset"
          >
            Next record
          </button>
        </section>

        <aside class="jukebox-tools stack">
          <SonificationControls
            :speed="speed"
            :is-playing="isPlaying"
            :disabled="status !== 'ready' || !audioUrl"
            @update:speed="speed = $event"
            @toggle="toggle"
          />

          <div class="card stack">
            <h2 class="section__title">Download</h2>
            <div class="download-grid">
              <a v-if="audioUrl" class="button" :href="audioUrl" :download="downloadName">
                Download WAV
              </a>
              <button v-else class="button" type="button" disabled>Download WAV</button>
              <button class="button" type="button" disabled title="Coming in phase 2">
                Download MP4 (TODO)
              </button>
              <button class="button" type="button" disabled title="Coming in phase 2">
                Download MIDI (TODO)
              </button>
              <button class="button" type="button" @click="share">Share</button>
            </div>
            <p v-if="shareMessage" class="muted">{{ shareMessage }}</p>
          </div>

          <ImageUploader @select="onFileSelected" />

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-else-if="status === 'processing'" class="muted">Processing image...</p>
          <p v-else class="muted">Ready. Press play to listen.</p>
        </aside>
      </main>

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
  </div>
</template>
