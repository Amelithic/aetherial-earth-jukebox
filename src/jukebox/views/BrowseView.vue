<script setup lang="ts">
import { useRouter } from 'vue-router'
import BrowseCard from '@/jukebox/components/BrowseCard.vue'
import JukeboxNav from '@/jukebox/components/JukeboxNav.vue'
import { datasets } from '@/assets/data/datasets'

const router = useRouter()

function play(id: string): void {
  void router.push({ name: 'jukebox-track', params: { id } })
}

function showDetails(id: string): void {
  void router.push({ name: 'browse-detail', params: { id } })
}
</script>

<template>
  <div class="page">
    <JukeboxNav />

    <main class="container page-body stack">
      <h1>Browse data...</h1>

      <section class="gallery" aria-label="Available records">
        <BrowseCard
          v-for="dataset in datasets"
          :key="dataset.id"
          :dataset="dataset"
          @play="play"
          @details="showDetails"
        />
      </section>
    </main>
  </div>
</template>
