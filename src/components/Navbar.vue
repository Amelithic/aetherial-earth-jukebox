<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo from '@/assets/images/EarthsJukeboxLogo.webp'
</script>

<template>
  <header class="site-nav">
    <RouterLink to="/" class="site-nav__logo" aria-label="Earth's Jukebox home">
      <img class="site-nav__logo-img" :src="logo" alt="Earth's Jukebox" />
    </RouterLink>

    <nav class="site-nav__links" aria-label="Main navigation">
      <RouterLink to="/jukebox/browse" class="button button--primary">Open Project</RouterLink>
      <RouterLink to="/about-us" class="button button--ghost">About Us</RouterLink>
    </nav>
  </header>
</template>
