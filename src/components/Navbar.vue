<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="navbar">
    <RouterLink to="/" class="navbar__logo">Aetherial Earth Jukebox</RouterLink>
    <nav class="navbar__links" aria-label="Main navigation">
      <RouterLink to="/jukebox" class="button">Open Project</RouterLink>
      <RouterLink to="/about-us" class="button">About Us</RouterLink>
    </nav>
  </header>
</template>
