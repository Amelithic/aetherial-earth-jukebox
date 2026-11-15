<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="page">
    <Navbar />

    <main class="container page-body stack">
      <section class="section">
        <h2 class="section__title">About Us - Meet the Team</h2>

        <div class="team-layout">
          <div class="photo-placeholder">Photo of the team (placeholder)</div>

          <div class="card stack">
            <h3>Team overview</h3>
            <ul class="plain-list">
              <li><strong>Name</strong> - Role</li>
              <li><strong>Name</strong> - Role</li>
              <li><strong>Name</strong> - Role</li>
            </ul>
          </div>
        </div>

        <p>
          We are a team taking part in the NASA Space Apps Challenge. Add a short description of
          where the team is from, what we are building, and why we chose this challenge.
        </p>

        <div class="about-links">
          <a class="button" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
          <a class="button" href="https://devpost.com/" target="_blank" rel="noreferrer">Devpost</a>
          <a class="button" href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer">
            NASA Space Apps
          </a>
        </div>
      </section>
    </main>
  </div>
</template>
