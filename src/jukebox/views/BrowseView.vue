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
    <div class="page-topbar">
      <JukeboxNav :show-browse="false" />
    </div>

    <main class="container container--browse page-body">
      <header>
        <p class="eyebrow">Record collection</p>
        <h1>Browse data...</h1>
        <div class="rule"></div>
      </header>

      <section class="panel gallery-panel" aria-label="Available records">
        <div class="gallery">
          <BrowseCard
            v-for="dataset in datasets"
            :key="dataset.id"
            :dataset="dataset"
            @play="play"
            @details="showDetails"
          />
        </div>
      </section>
    </main>
  </div>
</template>
