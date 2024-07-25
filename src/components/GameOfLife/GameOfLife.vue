<script setup lang="ts">
// Game of life (GOF) component

import { onErrorCaptured, ref, type Ref } from 'vue';
import GolGrid from './GolGrid.vue';
import GolControlPanel from './GolControlPanel.vue';

const errorMsg: Ref<string | null> = ref(null);
const isPLaying: Ref<boolean> = ref(false);
const grid: Ref<InstanceType<typeof GolGrid> | null> = ref(null);
const gridSize: Ref<{ rows: number; columns: number }> = ref({ rows: 15, columns: 30 });
const pagePercentage: Ref<number> = ref(50);
const cellLineStep = 10;
const events = {
  triggerPlay: triggerPlay,
  nextGeneration: nextGeneration,
  addRow: addRow,
  removeRow: removeRow,
  addColumn: addColumn,
  removeColumn: removeColumn,
  slowSim: slowSim,
  accelerateSim: accelerateSim,
  randomize: randomize,
  reset: reset,
  clearGrid: clearGrid
}

onErrorCaptured((err) => {
  console.error(err);
  errorMsg.value = err.message;
  return false;
});

function triggerPlay() {
  isPLaying.value = !isPLaying.value;
}
function nextGeneration() {
  if (grid.value) grid.value.nextGeneration();
}
function addRow() {
  gridSize.value.rows += cellLineStep;
}
function removeRow() {
  gridSize.value.rows -= cellLineStep;
}
function addColumn() {
  gridSize.value.columns += cellLineStep;
}
function removeColumn() {
  gridSize.value.columns -= cellLineStep;
}
function slowSim() {
  if (grid.value) grid.value.slowSim()
}
function accelerateSim() {
  if (grid.value) grid.value.accelerateSim()
}
function randomize() {
  if (grid.value) grid.value.randomizeGrid();
}
function reset() {
  if (grid.value) {
    isPLaying.value = false;
    grid.value.reset();
  }
}
function clearGrid() {
  if(grid.value) {
    isPLaying.value = false;
    grid.value.clearGrid();
  }
    
}

</script>

<template>
  <div class="wrapper">
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-else class="game-of-life">
      <GolGrid
        ref="grid"
        :isPlaying="isPLaying"
        :gridRows="gridSize.rows"
        :gridColumns="gridSize.columns"
        :pagePercentage="pagePercentage"
      ></GolGrid>
      <GolControlPanel
        :isPlaying="isPLaying"
        :cellLineStep="cellLineStep"
        v-on="events"
      ></GolControlPanel>
    </div>
  </div>
</template>

<style scoped>
.error {
  display: flex;
}
</style>
