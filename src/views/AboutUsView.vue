<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import earthPlaceholder from '@/assets/images/EarthPlaceholderKurzgesagt.png'
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
          <figure class="team-photo">
            <img class="team-photo__placeholder" :src="earthPlaceholder" alt="" />
            <figcaption>Team photo coming soon</figcaption>
          </figure>

          <div class="team-card">
            <h2>Who we are</h2>
            <ul class="team-list">
              <li>
                <strong>Name</strong>
                <span>Role</span>
              </li>
              <li>
                <strong>Name</strong>
                <span>Role</span>
              </li>
              <li>
                <strong>Name</strong>
                <span>Role</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="prose">
          <p>
            We are a team taking part in the NASA Space Apps Challenge. Add a short description of
            where the team is from, what we are building, and why we chose this challenge.
          </p>
          <p>
            We build with Vue, Three.js, and the Web Audio API to turn Earth observation imagery
            into a record collection you can listen to.
          </p>
        </div>

        <div class="about-links">
          <a class="button button--ghost" href="https://github.com/" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a class="button button--ghost" href="https://devpost.com/" target="_blank" rel="noreferrer">
            Devpost
          </a>
          <a
            class="button button--ghost"
            href="https://www.spaceappschallenge.org/"
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
