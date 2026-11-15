<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import aetherialLogo from '@/assets/images/AetherialLogo.webp'
import jukeboxLogo from '@/assets/images/EarthsJukeboxLogo.webp'
</script>

<template>
  <div class="page space-main">
    <Navbar />

    <main class="container container--narrow page-body">
      <header class="hero panel">
        <img class="hero__brand" :src="aetherialLogo" alt="Aetherial" />
        <img class="hero__product" :src="jukeboxLogo" alt="Earth's Jukebox" />
        <h1 class="sr-only">Aetherial Earth's Jukebox</h1>

        <p class="hero__copy">
          Turning NASA Earth imagery into sound. Each strip of an image becomes a note (or a chord), letting you
          listen to the sounds of the planet as a record you can play, spin, and explore!
        </p>

        <div class="hero__actions">
          <RouterLink to="/jukebox/browse" class="button button--primary">Play the jukebox</RouterLink>
          <RouterLink to="/about-us" class="button button--ghost">Meet the team</RouterLink>
        </div>

        <a class="hero__scroll" href="#overview" aria-label="Scroll to the overview">
          <span aria-hidden="true">&darr;</span>
        </a>
      </header>

      <section id="overview" class="panel">
        <div class="panel__header">
          <p class="eyebrow">The project</p>
          <h2>Overview</h2>
          <div class="rule"></div>
        </div>

        <p>
          Aetherial Earth Jukebox is a hackathon project for the NASA Space Apps Challenge. We
          sonify Earth observation data so that patterns in the data can be experienced through
          sound as well as sight.
        </p>
        <p>
          Read more about the challenge at
          <a href="https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/" target="_blank" rel="noreferrer">
            NASA Space Apps Challenge
          </a>.
        </p>
      </section>

      <section class="panel">
        <div class="panel__header">
          <p class="eyebrow">The process</p>
          <h2>How it works</h2>
          <div class="rule"></div>
        </div>

        <ol class="steps">
          <li>Choose a NASA Earth image in our browse tab or upload your own.</li>
          <li>We split the image into vertical slices and read the colour of each slice.</li>
          <li>Each colour becomes a pitch, and the slices are rendered into a playable track.</li>
          <li>Spin the globe, adjust the speed, and download the result as audio!</li>
        </ol>
      </section>

      <div class="cta-row">
        <RouterLink to="/jukebox/browse" class="button button--primary button--large">Play!</RouterLink>
      </div>
    </main>
  </div>
  <Footer />
</template>
