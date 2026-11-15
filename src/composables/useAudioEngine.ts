import { computed, onBeforeUnmount, ref } from 'vue'

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const remaining = total % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export function useAudioEngine() {
  const audioEl = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playbackRate = ref(1)
  const volume = ref(0.8)

  const progress = computed(() =>
    duration.value > 0 ? currentTime.value / duration.value : 0,
  )

  function play(): void {
    void audioEl.value?.play()
  }

  function pause(): void {
    audioEl.value?.pause()
  }

  function toggle(): void {
    const element = audioEl.value
    if (!element) return
    if (element.paused) play()
    else pause()
  }

  function seek(time: number): void {
    const element = audioEl.value
    if (!element) return

    const next = Math.min(Math.max(time, 0), duration.value || 0)
    element.currentTime = next
    currentTime.value = next
  }

  function setRate(rate: number): void {
    const next = Math.min(Math.max(rate, 0.25), 4)
    playbackRate.value = next
    if (audioEl.value) audioEl.value.playbackRate = next
  }

  function setVolume(nextVolume: number): void {
    const next = Math.min(Math.max(nextVolume, 0), 1)
    volume.value = next
    if (audioEl.value) audioEl.value.volume = next
  }

  function onTimeUpdate(): void {
    if (audioEl.value) currentTime.value = audioEl.value.currentTime
  }

  function onLoadedMetadata(): void {
    const element = audioEl.value
    if (!element) return

    duration.value = Number.isFinite(element.duration) ? element.duration : 0
    element.playbackRate = playbackRate.value
    element.volume = volume.value
  }

  function onPlay(): void {
    isPlaying.value = true
  }

  function onPause(): void {
    isPlaying.value = false
  }

  function onEnded(): void {
    isPlaying.value = false
    currentTime.value = 0
  }

  onBeforeUnmount(() => {
    audioEl.value?.pause()
  })

  return {
    audioEl,
    isPlaying,
    currentTime,
    duration,
    progress,
    playbackRate,
    volume,
    play,
    pause,
    toggle,
    seek,
    setRate,
    setVolume,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
  }
}
