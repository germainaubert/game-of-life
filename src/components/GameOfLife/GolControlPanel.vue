<script setup lang="ts">
const props = defineProps<{
  isPlaying: boolean
}>();

</script>

<template>
  <div class="controlPanel">
    <div class="buttons">
      <button @click="$emit('triggerPlay')">{{ props.isPlaying ? 'Pause' : 'Jouer' }}</button>
      <button @click="$emit('nextGeneration')">Suivant</button>
      <button @click="$emit('addRow')">+ 1 ligne</button>
      <button @click="$emit('removeRow')">- 1 ligne</button>
      <button @click="$emit('addColumn')">+ 1 colonne</button>
      <button @click="$emit('removeColumn')">- 1 colonne</button>
      <button @click="$emit('slowSim')">Slow down</button>
      <button @click="$emit('accelerateSim')">Speed up</button>
      <button @click="$emit('randomize')">Randomize</button>
      <button @click="$emit('reset')">Reset</button>
    </div>
  </div>
</template>

<style scoped>
.controlPanel {
  padding: 2% 0 0 0;
}

.buttons {
  display: flex;
  justify-content: center;
}

button {
  margin: 0 20px 0 20px;
}
</style>
