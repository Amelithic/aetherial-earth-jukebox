<script setup lang="ts">
import type { Dataset } from '@/assets/data/datasets'

defineProps<{ dataset: Dataset }>()

const emit = defineEmits<{
  play: [id: string]
  details: [id: string]
}>()
</script>

<template>
  <article
    class="browse-card card"
    tabindex="0"
    @click="emit('details', dataset.id)"
    @keydown.enter="emit('details', dataset.id)"
  >
    <p class="browse-card__name">{{ dataset.name }}</p>

    <div
      class="browse-card__disk"
      :style="{ backgroundImage: `url(${dataset.image})` }"
      aria-hidden="true"
    >
      <span class="browse-card__hole"></span>
    </div>

    <img class="browse-card__image" :src="dataset.image" :alt="dataset.name" />

    <button class="button button--primary" type="button" @click.stop="emit('play', dataset.id)">
      Play
    </button>
  </article>
</template>
