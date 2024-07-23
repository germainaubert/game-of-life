<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import GolCanvas from './GolCanvas.vue';
import type { Ref } from 'vue';
import type { Coordinate } from './GolInterface';

const props = defineProps<{
  gridRows: number;
  gridColumns: number;
  pagePercentage: number;
  isPlaying: boolean;
}>();

defineExpose({
  nextGeneration,
  randomizeGrid,
  reset,
  slowSim,
  accelerateSim,
  switchCellState
});

const grid: Ref<boolean[][]> = ref([]); // 2D array, true == alive, false == dead

let intervalDuration = 1000;
let intervalId: number | undefined = undefined;

onBeforeMount(() => {
  reset();
});

watch(() => [props.gridColumns,props.gridRows], () => {
  reset();
})

watch(() => props.isPlaying, (isPlaying: boolean) => {
  handleInterval(isPlaying);
})

function handleInterval(isPlaying: boolean) {
  if(isPlaying) {
    intervalId = setInterval(() => {
      nextGeneration();
    }, intervalDuration);
  } else if(intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

function reset() {
  initGrid()
  randomizeGrid();
}

function initGrid(): void {
  grid.value = Array.from({ length: props.gridColumns }, () =>
    Array.from({ length: props.gridRows }, () => false)
  );
}

function randomizeGrid(): void {
  const newGeneration = JSON.parse(JSON.stringify(grid.value));
  for(let x = 0; x < grid.value.length; x++) {
    for(let y = 0; y < grid.value[x].length; y++) {
      newGeneration[x][y] = (() => {
        if(Math.random() > 0.3) return false;
        else return true;
      })()
    }
  }
  grid.value = newGeneration;
}

function slowSim() {
  intervalDuration =  intervalDuration * 2;
  clearInterval(intervalId);
  handleInterval(props.isPlaying);
}

function accelerateSim() {
  intervalDuration = intervalDuration / 2;
  clearInterval(intervalId);
  handleInterval(props.isPlaying);
}

function nextGeneration() {
  const newGeneration = JSON.parse(JSON.stringify(grid.value));
  for (let x = 0; x < grid.value.length; x++) {
    for (let y = 0; y < grid.value[x].length; y++) {
      newGeneration[x][y] = getCellStatus(x, y);
    }
  }
  grid.value = newGeneration;
}

function getCellStatus(x: number, y: number): boolean {
  const neighbors = checkCellNeighbors(x, y);
  if(neighbors === 3) return true;
  else if(neighbors == 2 && grid.value[x][y]) return true;
  else return false;
}

function checkCellNeighbors(x: number, y: number): number {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
  ];
  let neighbors = 0;
  for(const direction of directions) {
    const [dx, dy] = direction;
    const nx = x + dx;
    const ny = y + dy;
    if(nx >= 0 && nx < props.gridRows && ny >= 0 && ny < props.gridColumns) {
      if(grid.value[nx][ny]) neighbors++;
    }
  }
  return neighbors;
}

function switchCellState(cellPos: Coordinate): void {
  const updatedGrid = JSON.parse(JSON.stringify(grid.value));
  console.log(updatedGrid[cellPos.x][cellPos.y]);
  updatedGrid[cellPos.x][cellPos.y] = !updatedGrid[cellPos.x][cellPos.y];
  grid.value = updatedGrid;
}

</script>

<template>
  <div class="grid">
    <GolCanvas :gridRows="gridRows" :gridColumns="gridColumns" :pagePercentage="pagePercentage" :grid="grid" @switchCellState="switchCellState"></GolCanvas>
  </div>
</template>

<style scoped>
.grid {
  margin-top: 1%;
  text-align: center;
}
</style>
