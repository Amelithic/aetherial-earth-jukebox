<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import JukeboxNav from '@/jukebox/components/JukeboxNav.vue'
import { getDatasetById } from '@/assets/data/datasets'

const route = useRoute()
const router = useRouter()

const dataset = computed(() => getDatasetById(route.params.id as string | undefined))

function play(): void {
  void router.push({ name: 'jukebox-track', params: { id: dataset.value.id } })
}
</script>

<template>
  <div class="page">
    <div class="container container--browse page-topbar">
      <JukeboxNav :show-browse="false" />
    </div>

    <main class="container container--browse page-body">
      <article class="panel">
        <div class="detail-header">
          <p class="eyebrow">Record details</p>
          <h1>{{ dataset.name }}</h1>
          <div class="rule"></div>
        </div>

        <div class="detail-layout">
          <img class="detail-image" :src="dataset.image" :alt="dataset.name" />

          <div class="detail-copy">
            <p>{{ dataset.description }}</p>
            <p>{{ dataset.longDescription }}</p>

            <dl class="detail-meta">
              <dt>Source</dt>
              <dd>{{ dataset.source }}</dd>
              <dt>Date</dt>
              <dd>{{ dataset.date }}</dd>
              <dt>Credit</dt>
              <dd>{{ dataset.credit }}</dd>
            </dl>

            <div class="hero__actions">
              <button class="button button--primary" type="button" @click="play">
                Play this record
              </button>
              <RouterLink to="/jukebox/browse" class="button button--ghost">
                Back to Browse
              </RouterLink>
            </div>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>
