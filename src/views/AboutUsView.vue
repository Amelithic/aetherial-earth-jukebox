<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import teamImg from '/images/team.jpg'
</script>

<template>
  <div class="page">
    <Navbar />

    <main class="container container--narrow page-body">
      <section class="panel">
        <div class="panel__header">
          <p class="eyebrow">Our team</p>
          <h1>About Us - Meet the Team</h1>
          <div class="rule"></div>
        </div>

        <div class="team-layout">
          <img class="team-photo" :src="teamImg" alt="" />

          <div class="team-card">
            <h2>Who we are</h2>
            <ul class="team-list">
              <li>
                <strong>Amelie</strong>
                <span>Web Development / Software</span>
              </li>
              <li>
                <strong>Joey</strong>
                <span>Audio / Graphic Designer</span>
              </li>
              <li>
                <strong>Adam</strong>
                <span>User Experience / Ideation</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="prose">
          <p>
            We are a team of rural Irish students, interested in software, sound engineering and product design. We had a deep interest in space technology, and created this project as a fun way to work together on an idea, working from home!
          </p>
          <p>
            We built this site with Vue, Three.js, and the Web Audio API to turn Earth observation imagery
            into a record collection you can listen to!
          </p>
        </div>

        <div class="about-links">
          <a class="button button--ghost" href="https://github.com/Amelithic/aetherial-earth-jukebox" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a
            class="button button--ghost"
            href="https://www.spaceappschallenge.org/2026/find-a-team/aetherial/"
            target="_blank"
            rel="noreferrer"
          >
            NASA Space Apps
          </a>
        </div>
      </section>
    </main>
  </div>
</template>
