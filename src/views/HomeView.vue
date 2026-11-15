<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="page">
    <Navbar />

    <main class="container page-body stack">
      <header class="hero card stack">
        <p class="muted">NASA Space Apps Challenge 2026</p>
        <h1>Aetherial Earth Jukebox</h1>
        <p>
          Turn NASA Earth imagery into sound. Each strip of an image becomes a note, letting you
          listen to our planet as a record you can play, spin, and explore.
        </p>
        <div class="hero__actions">
          <RouterLink to="/jukebox" class="button button--primary">Play the jukebox</RouterLink>
        </div>
      </header>

      <section class="section">
        <h2 class="section__title">Overview</h2>
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

      <section class="section">
        <h2 class="section__title">Screenshot</h2>
        <div class="screenshot-placeholder">Screenshot of the project (placeholder)</div>
      </section>

      <section class="section">
        <h2 class="section__title">How it works</h2>
        <ol class="steps">
          <li>Choose a NASA Earth image or upload your own.</li>
          <li>We split the image into vertical slices and read the colour of each slice.</li>
          <li>Each colour becomes a pitch, and the slices are rendered into a playable track.</li>
          <li>Spin the globe, adjust the speed, and download the result as audio.</li>
        </ol>
      </section>

      <div class="hero__actions">
        <RouterLink to="/jukebox" class="button button--primary">Play!</RouterLink>
      </div>
    </main>
  </div>
</template>
