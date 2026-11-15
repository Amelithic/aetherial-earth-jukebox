<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{ showBrowse?: boolean }>()
</script>

<template>
  <nav class="jukebox-nav" aria-label="Jukebox navigation">
    <RouterLink to="/" class="button button--ghost">Return Home</RouterLink>
    <RouterLink v-if="showBrowse !== false" to="/jukebox/browse" class="button">
      Browse more
    </RouterLink>
  </nav>
</template>
