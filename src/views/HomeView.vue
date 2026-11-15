<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import aetherialLogo from '@/assets/images/AetherialLogo.webp'
import jukeboxLogo from '@/assets/images/EarthsJukeboxLogo.webp'
import conceptImage from '@/assets/images/concept-jukebox.webp'
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
          Turn NASA Earth imagery into sound. Each strip of an image becomes a note, letting you
          listen to our planet as a record you can play, spin, and explore.
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
          <a href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer">
            NASA Space Apps Challenge
          </a>.
        </p>
      </section>

      <section class="panel">
        <div class="panel__header">
          <p class="eyebrow">A look inside</p>
          <h2>Screenshot</h2>
          <div class="rule"></div>
        </div>

        <figure class="screenshot-frame">
          <img
            :src="conceptImage"
            alt="Concept artwork of the Earth's Jukebox, showing a globe inside a retro jukebox cabinet."
          />
          <figcaption>Early concept artwork for the jukebox interface.</figcaption>
        </figure>
      </section>

      <section class="panel">
        <div class="panel__header">
          <p class="eyebrow">The process</p>
          <h2>How it works</h2>
          <div class="rule"></div>
        </div>

        <ol class="steps">
          <li>Choose a NASA Earth image or upload your own.</li>
          <li>We split the image into vertical slices and read the colour of each slice.</li>
          <li>Each colour becomes a pitch, and the slices are rendered into a playable track.</li>
          <li>Spin the globe, adjust the speed, and download the result as audio.</li>
        </ol>
      </section>

      <div class="cta-row">
        <RouterLink to="/jukebox/browse" class="button button--primary button--large">Play!</RouterLink>
      </div>
    </main>
  </div>
  <Footer />
</template>
