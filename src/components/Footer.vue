<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo from '@/assets/images/EarthsJukeboxLogo.png'
</script>

<template>
  <header class="site-nav">
    <RouterLink to="/" class="site-nav__logo" aria-label="Earth's Jukebox home">
      <img class="site-nav__logo-img-small" :src="logo" alt="Earth's Jukebox" />
    </RouterLink>

    <div class="site-nav__links" aria-label="Main credits">
      <p style="font-size: smaller;">Image credits to NASA</p>
    </div>
  </header>
</template>
