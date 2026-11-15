<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { PhCaretDown, PhSlidersHorizontal } from '@phosphor-icons/vue'

const props = defineProps<{
  speed: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:speed': [value: number]
}>()

const presets = [0.5, 0.75, 1, 1.25, 1.5, 2]
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const customOpen = ref(false)
const customSpeed = ref(props.speed)

const speedLabel = computed(() => `${Number(props.speed.toFixed(2))}x`)

function formatSpeed(value: number): string {
  return `${Number(value.toFixed(2))}x`
}

function toggleMenu(): void {
  if (props.disabled) return
  open.value = !open.value

  if (open.value) customSpeed.value = props.speed
  else customOpen.value = false
}

function choose(value: number): void {
  emit('update:speed', value)
  customSpeed.value = value
  open.value = false
  customOpen.value = false
}

function openCustom(): void {
  customSpeed.value = props.speed
  customOpen.value = true
}

function onCustomInput(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  customSpeed.value = value
  emit('update:speed', value)
}

function onDocumentPointerDown(event: PointerEvent): void {
  if (!open.value || !root.value) return
  if (!root.value.contains(event.target as Node)) {
    open.value = false
    customOpen.value = false
  }
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <div ref="root" class="speed-control">
    <button
      class="speed-control__trigger"
      type="button"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="menu"
      title="Playback speed"
      @click="toggleMenu"
    >
      <span>{{ speedLabel }}</span>
      <PhCaretDown :size="11" weight="bold" :class="{ 'is-open': open }" />
    </button>

    <div v-if="open" class="speed-control__menu" role="menu">
      <div class="speed-control__presets">
        <button
          v-for="preset in presets"
          :key="preset"
          class="speed-control__option"
          :class="{ 'is-active': Math.abs(preset - speed) < 0.001 }"
          type="button"
          role="menuitemradio"
          :aria-checked="Math.abs(preset - speed) < 0.001"
          @click="choose(preset)"
        >
          {{ formatSpeed(preset) }}
        </button>
      </div>

      <button
        class="speed-control__custom-trigger"
        :class="{ 'is-active': customOpen }"
        type="button"
        :aria-expanded="customOpen"
        @click="openCustom"
      >
        <span>
          <PhSlidersHorizontal :size="14" weight="bold" />
          Custom
        </span>
        <span>{{ formatSpeed(customSpeed) }}</span>
      </button>

      <div v-if="customOpen" class="speed-control__custom">
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          :value="customSpeed"
          aria-label="Custom playback speed"
          @input="onCustomInput"
        />
        <span>{{ formatSpeed(customSpeed) }}</span>
      </div>
    </div>
  </div>
</template>
