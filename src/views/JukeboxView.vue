<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhCaretDown,
  PhCaretUp,
  PhDiscoBall,
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
  PhSliders
} from '@phosphor-icons/vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import SonificationControls from '@/components/SonificationControls.vue'
import Visualiser from '@/components/Visualiser.vue'
import JukeboxNav from '@/jukebox/components/JukeboxNav.vue'
import ProcessingOverlay from '@/jukebox/components/ProcessingOverlay.vue'
import funkyBeatUrl from '@/assets/audio/FunkyBeat.wav'
import mythologicalBeatUrl from '@/assets/audio/MythologyMode.wav'
import atlasImage from '@/assets/images/AtlasHoldingTheEarthJukebox.webp'
import atlasOverlay from '@/assets/images/MythologyModeOverlay.webp'
import jukeboxBlank from '@/assets/images/JukeboxBlank.webp'
import volumeDial from '@/assets/images/VolumeDial.webp'
import { getDatasetById, getNextDataset, getPreviousDataset } from '@/assets/data/datasets'
import { useAudioEngine } from '@/composables/useAudioEngine'
import { useImageProcessor } from '@/composables/useImageProcessor'
import { useJukeboxSounds } from '@/composables/useJukeboxSounds'
import { useSonification } from '@/composables/useSonification'

const route = useRoute()
const router = useRouter()

const {
  audioEl,
  isPlaying,
  currentTime,
  duration,
  volume,
  loop,
  toggle,
  seek,
  setRate,
  setVolume,
  setLoop,
  pause,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onEnded,
} = useAudioEngine()

const { processImage } = useImageProcessor()
const { renderToBuffer, bufferToWav } = useSonification()
const { playButtonSelect, playKnobTweak } = useJukeboxSounds()

const sonificationOptions = reactive({
  secondsPerSlice: 0.2,
  sampleRate: 44100,
  volume: 0.35,
  waveform: 'sine',
  octaveShift: 1,
  reverb: false,
})

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
const showDebug = ref(false)
const sonificationMode = ref<'single' | 'chord' | 'arpeggio'>('single')
const selectedScale = ref<'major' | 'minor' | 'pentatonicMajor' | 'pentatonicMinor' | 'blues'>('major')
const excludeBackground = ref(true)
const backgroundThreshold = ref(40)
const downloadName = computed(() =>
  customImage.value ? 'custom-image.wav' : `${currentDataset.value.id}.wav`,
)

const volumePercent = computed(() => Math.round(volume.value * 100))
const knobAngle = computed(() => -135 + volumePercent.value * 1)

const themeOrder = ['normal', 'disco', 'mythology'] as const
type JukeboxTheme = (typeof themeOrder)[number]
const theme = ref<JukeboxTheme>('normal')
const themeLabel = computed(() => {
  const labels: Record<JukeboxTheme, string> = {
    normal: 'Normal',
    disco: 'Disco',
    mythology: 'Mythology',
  }

  return labels[theme.value]
})
const nextThemeLabel = computed(
  () => themeOrder[(themeOrder.indexOf(theme.value) + 1) % themeOrder.length],
)
const nextThemeTitle = computed(() => {
  const labels: Record<JukeboxTheme, string> = {
    normal: 'Normal',
    disco: 'Disco',
    mythology: 'Mythology',
  }

  return labels[nextThemeLabel.value]
})

const discoMusic = new Audio(funkyBeatUrl)
discoMusic.loop = true
discoMusic.preload = 'auto'
discoMusic.volume = Math.min(0.2, volume.value * 0.10)

function syncDiscoMusic(active: boolean): void {
  if (active) {
    discoMusic.currentTime = 0
    void discoMusic.play().catch((err) => {
      console.error('Disco audio playback failed:', err)
    })
    return
  }

  discoMusic.pause()
  discoMusic.currentTime = 0
}

const mythologyMusic = new Audio(mythologicalBeatUrl)
mythologyMusic.loop = true
mythologyMusic.preload = 'auto'
mythologyMusic.volume = Math.min(0.2, volume.value * 0.025)

function syncMythologyMusic(active: boolean): void {
  if (active) {
    mythologyMusic.currentTime = 0
    void mythologyMusic.play().catch((err) => {
      console.error('Mythology audio playback failed:', err)
    })
    return
  }

  mythologyMusic.pause()
  mythologyMusic.currentTime = 0
}

function cycleTheme(): void {
  const index = themeOrder.indexOf(theme.value)
  theme.value = themeOrder[(index + 1) % themeOrder.length]

  syncDiscoMusic(theme.value === 'disco')
  syncMythologyMusic(theme.value === 'mythology')
}

function onJukeboxClick(event: MouseEvent): void {
  const target = event.target
  if (!(target instanceof Element)) return

  const control = target.closest('button, a')
  if (!control) return
  if (control.getAttribute('aria-disabled') === 'true') return
  if (control instanceof HTMLButtonElement && control.disabled) return

  playButtonSelect()
}

watch(volume, (value) => {
  discoMusic.volume = Math.min(0.2, value * 0.15)
  mythologyMusic.volume = Math.min(0.2, value * 0.15)
})

type ConfettiPiece = {
  id: number
  left: number
  delay: number
  duration: number
  drift: number
  spin: number
  width: number
  height: number
  color: string
  radius: string
}

const confettiColors = ['#ff5bd7', '#5be7ff', '#ffe45b', '#8bff9f', '#ff9f5b', '#c08bff']
const confettiPieces: ConfettiPiece[] = Array.from({ length: 64 }, (_, index) => {
  const width = 5 + Math.random() * 7

  return {
    id: index,
    left: Math.random() * 100,
    delay: -Math.random() * 9,
    duration: 5.5 + Math.random() * 5,
    drift: (Math.random() * 2 - 1) * 180,
    spin: 360 + Math.random() * 900,
    width,
    height: width * (1.2 + Math.random() * 1.1),
    color: confettiColors[index % confettiColors.length],
    radius: index % 3 === 0 ? '50%' : '2px',
  }
})

function confettiStyle(piece: ConfettiPiece): Record<string, string> {
  return {
    '--confetti-left': `${piece.left}%`,
    '--confetti-delay': `${piece.delay}s`,
    '--confetti-duration': `${piece.duration}s`,
    '--confetti-drift': `${piece.drift}px`,
    '--confetti-spin': `${piece.spin}deg`,
    background: piece.color,
    width: `${piece.width}px`,
    height: `${piece.height}px`,
    borderRadius: piece.radius,
  }
}

let runToken = 0

async function processCurrentImage(): Promise<void> {
  const token = ++runToken
  status.value = 'processing'
  errorMessage.value = ''
  shareMessage.value = ''
  pause()

  try {
    const slices = await processImage(
      activeImage.value,
      160,
      excludeBackground.value,
      backgroundThreshold.value,
    )
    const buffer = await renderToBuffer(slices, {
      ...sonificationOptions,
      mode: sonificationMode.value,
      scale: selectedScale.value,
    })
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

let reprocessTimer: ReturnType<typeof setTimeout> | null = null

function scheduleReprocess(): void {
  if (reprocessTimer) clearTimeout(reprocessTimer)
  reprocessTimer = setTimeout(() => {
    reprocessTimer = null
    void processCurrentImage()
  }, 300)
}

watch([excludeBackground, backgroundThreshold], scheduleReprocess)
watch([sonificationOptions, sonificationMode, selectedScale], scheduleReprocess, { deep: true })

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

function updateKnobVolume(value: number): void {
  const next = clampVolume(value)
  if (next === volume.value) return

  setVolume(next)
  playKnobTweak()
}

const knobDrag = ref<{ startY: number; startVolume: number } | null>(null)

function onKnobPointerDown(event: PointerEvent): void {
  knobDrag.value = { startY: event.clientY, startVolume: volume.value }
    ; (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onKnobPointerMove(event: PointerEvent): void {
  if (!knobDrag.value) return

  const delta = (knobDrag.value.startY - event.clientY) / 140
  updateKnobVolume((knobDrag.value.startVolume + delta))
}

function onKnobPointerUp(event: PointerEvent): void {
  knobDrag.value = null
  const element = event.currentTarget as HTMLElement

  if (element.hasPointerCapture(event.pointerId)) {
    element.releasePointerCapture(event.pointerId)
  }
}

function onKnobWheel(event: WheelEvent): void {
  updateKnobVolume(volume.value + (event.deltaY < 0 ? 0.05 : -0.05))
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
    updateKnobVolume(next)
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
  if (reprocessTimer) clearTimeout(reprocessTimer)
  discoMusic.pause()
  mythologyMusic.pause()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  if (customImage.value) URL.revokeObjectURL(customImage.value)
})
</script>

<template>
  <div class="jukebox-page" :class="{ 'theme-disco': theme === 'disco', 'theme-mythology': theme === 'mythology' }"
    :data-theme="theme" @click.capture="onJukeboxClick">
    <div class="jukebox-page__bg" :style="{ backgroundImage: `url(${activeImage})` }"></div>
    <div class="jukebox-page__tint"></div>

    <div v-if="theme === 'disco'" class="disco-lights" aria-hidden="true">
      <span v-for="beam in 7" :key="beam" class="disco-beam"></span>
    </div>

    <img v-if="theme === 'mythology'" class="jukebox-atlas-overlay" :src="atlasOverlay" alt="" aria-hidden="true"
      draggable="false" />

    <div class="jukebox-shell">
      <header class="jukebox-topbar">
        <JukeboxNav :show-browse="true" />

        <div class="now-playing">
          <span class="now-playing__disc" :class="{ 'is-spinning': isPlaying }"
            :style="{ backgroundImage: `url(${activeImage})` }" aria-hidden="true"></span>
          <div>
            <p class="now-playing__label">Now playing</p>
            <p class="now-playing__name">{{ currentTitle }}</p>
          </div>
        </div>
      </header>

      <main class="jukebox-stage">
        <div class="jukebox-cabinet">
          <img v-if="theme === 'mythology'" class="jukebox-atlas" :src="atlasImage" alt="" aria-hidden="true"
            draggable="false" />

          <img class="jukebox-cabinet__base" :src="jukeboxBlank" alt="Retro jukebox cabinet" draggable="false" />

          <div class="jukebox-cabinet__screen">
            <Visualiser :texture-url="activeImage" />
          </div>

          <p class="jukebox-cabinet__track">{{ currentTitle }}</p>

          <div class="jukebox-knob" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100"
            :aria-valuenow="volumePercent" :aria-valuetext="`Volume ${volumePercent}%`" @pointerdown="onKnobPointerDown"
            @pointermove="onKnobPointerMove" @pointerup="onKnobPointerUp" @pointercancel="onKnobPointerUp"
            @wheel.prevent="onKnobWheel" @keydown="onKnobKeydown">
            <span class="jukebox-knob__value">VOL {{ volumePercent }}%</span>
            <img :src="volumeDial" alt="" draggable="false" :style="{ transform: `rotate(${knobAngle}deg)` }" />
          </div>

          <div class="jukebox-transport">
            <button class="jukebox-transport__skip" type="button" title="Previous track" aria-label="Previous track"
              @click="goToPreviousDataset">
              <PhSkipBack :size="16" weight="fill" />
            </button>

            <button class="jukebox-transport__play" type="button" :disabled="status !== 'ready' || !audioUrl"
              :aria-label="isPlaying ? 'Pause' : 'Play'" @click="toggle">
              <PhPause v-if="isPlaying" :size="24" weight="fill" />
              <PhPlay v-else :size="24" weight="fill" />
            </button>

            <button class="jukebox-transport__skip" type="button" title="Next track" aria-label="Next track"
              @click="goToNextDataset">
              <PhSkipForward :size="16" weight="fill" />
            </button>
          </div>
        </div>
      </main>

      <aside class="jukebox-rack" aria-label="Download, share, and upload">
        <a v-if="audioUrl" class="jukebox-rack__button" :href="audioUrl" :download="downloadName" title="Download WAV"
          aria-label="Download WAV" data-label="Download WAV">
          <PhFileAudio :size="21" weight="fill" />
        </a>
        <button v-else class="jukebox-rack__button" type="button" disabled title="Download WAV"
          aria-label="Download WAV" data-label="Download WAV">
          <PhFileAudio :size="21" weight="fill" />
        </button>

        <button class="jukebox-rack__button" type="button" disabled title="MP4 export coming soon"
          aria-label="MP4 export coming soon" data-label="MP4 coming soon">
          <PhFilmStrip :size="21" weight="fill" />
        </button>

        <button class="jukebox-rack__button" type="button" disabled title="MIDI export coming soon"
          aria-label="MIDI export coming soon" data-label="MIDI coming soon">
          <PhMusicNotes :size="21" weight="fill" />
        </button>

        <button class="jukebox-rack__button" type="button" title="Share this record" aria-label="Share this record"
          data-label="Share" @click="share">
          <PhShareNetwork :size="21" weight="fill" />
        </button>

        <span class="jukebox-rack__divider" aria-hidden="true"></span>

        <button class="jukebox-rack__button" type="button" title="Upload your own image"
          aria-label="Upload your own image" data-label="Upload image" @click="showUpload = true">
          <PhUploadSimple :size="21" weight="bold" />
        </button>

        <p v-if="shareMessage" class="share-message">{{ shareMessage }}</p>
      </aside>

      <div class="jukebox-bottom">
        <div v-if="showControls" class="jukebox-controls">
          <AudioPlayer :is-playing="isPlaying" :current-time="currentTime" :duration="duration" :volume="volume"
            :loop="loop" :disabled="status !== 'ready' || !audioUrl" @toggle="toggle" @seek="seek"
            @previous="goToPreviousDataset" @next="goToNextDataset" @update:loop="setLoop" @update:volume="setVolume" />

          <SonificationControls :speed="speed" :disabled="status !== 'ready'" @update:speed="speed = $event" />

          <button class="icon-button jukebox-controls__hide" type="button" title="Hide controls"
            aria-label="Hide controls" @click="showControls = false">
            <PhCaretDown :size="16" weight="bold" />
          </button>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>

        <button v-else class="button button--ghost jukebox-controls__show" type="button" @click="showControls = true">
          <PhCaretUp :size="15" weight="bold" />
          Show controls
        </button>
      </div>

<div class="jukebox-bottom__extra">
        <button class="jukebox-debug" type="button" title="Debug settings"
          aria-label="Settings" @click="showDebug = true">
          <PhSliders :size="23" weight="fill" />
        </button>
      </div>

      <Transition name="fade">
        <div v-if="showDebug" class="debug-overlay" @click.self="showDebug = false">
          <div class="debug-panel">
            <h3>Debug Panel</h3>
            <p class="debug-label">Sonification Options</p>
            <div class="debug-setting">
              <span class="debug-key">secondsPerSlice:</span>
              <input type="number" v-model.number="sonificationOptions.secondsPerSlice" step="0.01" min="0.01" max="1" />
            </div>
            <div class="debug-setting">
              <span class="debug-key">volume:</span>
              <input type="range" :min="0.1" :max="1" :step="0.1" v-model="sonificationOptions.volume" />
              <span>{{ sonificationOptions.volume }}</span>
            </div>
            <div class="debug-setting">
              <span class="debug-key">octave shift:</span>
              <input type="range" :min="-5" :max="5" :step="1" v-model="sonificationOptions.octaveShift" />
              <span>{{ sonificationOptions.octaveShift }}</span>
            </div>
            <div class="debug-setting">
              <span class="debug-key">waveform:</span>
              <select v-model="sonificationOptions.waveform">
                <option value="triangle">Triangle</option>
                <option value="sine">Sine</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div class="debug-setting">
              <span class="debug-key">reverb:</span>
              <input type="checkbox" v-model="sonificationOptions.reverb" />
            </div>
            <div class="debug-setting">
              <span class="debug-key">mode:</span>
              <select v-model="sonificationMode">
                <option value="single">Single</option>
                <option value="chord">Chord</option>
                <option value="arpeggio">Arpeggio</option>
              </select>
            </div>
            <div class="debug-setting">
              <span class="debug-key">scale:</span>
              <select v-model="selectedScale">
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="pentatonicMajor">Pentatonic Major</option>
                <option value="pentatonicMinor">Pentatonic Minor</option>
                <option value="blues">Blues</option>
              </select>
            </div>
            <p class="debug-label">Background Exclusion</p>
            <div class="debug-setting">
              <span class="debug-key">excludeBackground:</span>
              <input type="checkbox" v-model="excludeBackground" />
            </div>
            <div class="debug-setting">
              <span class="debug-key">backgroundThreshold:</span>
              <input type="range" min="0" max="100" step="1" v-model.number="backgroundThreshold" />
              <span>{{ backgroundThreshold }}</span>
            </div>
            <button class="button button--ghost" @click="showDebug = false">Close</button>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="theme === 'disco'" class="disco-confetti" aria-hidden="true">
      <span v-for="piece in confettiPieces" :key="piece.id" class="disco-confetti__piece"
        :style="confettiStyle(piece)"></span>
    </div>

    <button class="jukebox-theme" type="button" :title="`Theme: ${themeLabel}. Click for ${nextThemeTitle}.`"
      :aria-label="`Theme: ${themeLabel}. Switch to ${nextThemeTitle} theme.`" @click="cycleTheme">
      <PhDiscoBall :size="23" weight="fill" />
      <span v-if="theme !== 'normal'" class="jukebox-theme__badge">{{ themeLabel }}</span>
    </button>
    <p class="sr-only" aria-live="polite">Theme: {{ themeLabel }}</p>

    <audio ref="audioEl" :src="audioUrl" preload="auto" hidden @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata" @play="onPlay" @pause="onPause" @ended="onEnded"></audio>

    <ProcessingOverlay :visible="status === 'processing'" />

    <Transition name="upload-fade">
      <div v-if="showUpload" class="upload-overlay" @click.self="showUpload = false">
        <section class="upload-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
          <button class="icon-button upload-panel__close" type="button" title="Close upload dialog"
            aria-label="Close upload dialog" @click="showUpload = false">
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
