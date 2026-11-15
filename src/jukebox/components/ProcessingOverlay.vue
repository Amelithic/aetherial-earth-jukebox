<script setup lang="ts">
defineProps<{
  visible: boolean
  label?: string
}>()
</script>

<template>
  <div v-if="visible" class="processing-overlay" role="status" aria-live="polite">
    <div class="processing-overlay__spinner" aria-hidden="true"></div>
    <p>{{ label ?? 'Sonifying image...' }}</p>
  </div>
</template>
