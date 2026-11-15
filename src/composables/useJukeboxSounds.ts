import { onBeforeUnmount } from 'vue'
import buttonSelectUrl from '@/assets/audio/ButtonSelect.ogg'
import knobTweakUrl from '@/assets/audio/KnobTweak.ogg'

type SoundPool = {
  clips: HTMLAudioElement[]
  cursor: number
  volume: number
}

function createPool(source: string, size: number, volume: number): SoundPool {
  return {
    clips: Array.from({ length: size }, () => {
      const clip = new Audio(source)
      clip.preload = 'auto'
      clip.volume = volume
      return clip
    }),
    cursor: 0,
    volume,
  }
}

function playFromPool(pool: SoundPool): void {
  const clip = pool.clips[pool.cursor]
  pool.cursor = (pool.cursor + 1) % pool.clips.length
  clip.currentTime = 0
  clip.volume = pool.volume
  void clip.play().catch(() => undefined)
}

export function useJukeboxSounds() {
  const buttonPool = createPool(buttonSelectUrl, 3, 0.34)
  const knobPool = createPool(knobTweakUrl, 3, 0.26)
  let lastKnobPlayedAt = -Infinity

  function playButtonSelect(): void {
    playFromPool(buttonPool)
  }

  function playKnobTweak(): void {
    const now = performance.now()
    if (now - lastKnobPlayedAt < 36) return

    lastKnobPlayedAt = now
    playFromPool(knobPool)
  }

  onBeforeUnmount(() => {
    for (const clip of [...buttonPool.clips, ...knobPool.clips]) {
      clip.pause()
    }
  })

  return { playButtonSelect, playKnobTweak }
}
