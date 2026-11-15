<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="jukebox-nav">
    <RouterLink to="/" class="button">Return Home</RouterLink>
    <RouterLink to="/jukebox/browse" class="button">Browse more</RouterLink>
  </header>
</template>
