<script setup lang="ts">
import type { Dataset } from '@/assets/data/datasets'
import earthPlaceholder from '@/assets/images/EarthPlaceholderKurzgesagt.webp'

defineProps<{ dataset: Dataset }>()

const emit = defineEmits<{
  play: [id: string]
  details: [id: string]
}>()
</script>

<template>
  <article
    class="browse-card"
    tabindex="0"
    @click="emit('details', dataset.id)"
    @keydown.enter="emit('details', dataset.id)"
  >
    <img class="browse-card__image" :src="dataset.image" :alt="dataset.name" />
    <div class="browse-card__shade" aria-hidden="true"></div>

    <p class="browse-card__name">{{ dataset.name }}</p>

    <div class="browse-card__disk" aria-hidden="true">
      <img class="browse-card__disk-img" :src="dataset.image" alt="" />
      <img class="browse-card__label" :src="earthPlaceholder" alt="" />
      <span class="browse-card__hole"></span>
    </div>

    <button
      class="browse-card__play"
      type="button"
      :aria-label="`Play ${dataset.name}`"
      @click.stop="emit('play', dataset.id)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  </article>
</template>
