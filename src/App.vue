<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="app">
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
}
</style>
