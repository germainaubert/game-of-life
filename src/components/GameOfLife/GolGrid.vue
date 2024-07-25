<script setup lang="ts">
import { onBeforeMount, watch, ref, type Ref } from 'vue';
import GolCanvas from './GolCanvas.vue';
import Cell from '@/models/Cell';

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
  clearGrid
});

let grid: Ref<Cell[][]> = ref([]); // 2D array, true == alive, false == dead

const defaultIntervalDuration = 1000;
let intervalDuration = defaultIntervalDuration;
let intervalId: number | undefined = undefined;
const golCanvas: Ref<InstanceType<typeof GolCanvas> | null> = ref(null);

onBeforeMount(() => {
  initGrid();
});

watch(
  () => [props.gridColumns, props.gridRows],
  () => {
    reset();
  }
);

watch(
  () => props.isPlaying,
  (isPlaying: boolean) => {
    handleInterval(isPlaying);
  }
);

function handleInterval(isPlaying: boolean) {
  if (isPlaying) {
    intervalId = setInterval(() => {
      nextGeneration();
    }, intervalDuration);
  } else if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

function reset() {
  intervalDuration = defaultIntervalDuration;
  initGrid();
}

function initGrid(statusDefault?: boolean): void {
  grid.value = Array.from({ length: props.gridColumns }, (_, x) =>
    Array.from({ length: props.gridRows }, (_, y) => new Cell(x, y, statusDefault))
  );
}

function clearGrid(): void {
  initGrid(false);
}

function randomizeGrid(): void {
  grid.value.forEach((cellArray: Cell[]) => cellArray.forEach((cell: Cell) => cell.randomizeStatus()))
}

function slowSim() {
  intervalDuration = intervalDuration * 2;
  clearInterval(intervalId);
  handleInterval(props.isPlaying);
}

function accelerateSim() {
  intervalDuration = intervalDuration / 2;
  clearInterval(intervalId);
  handleInterval(props.isPlaying);
}

// fix updateStatus 
function nextGeneration() {
  const gridFreezedState = grid.value.map((cellArray: Cell[]) => cellArray.map((cell: Cell) => cell.getStatus()))
  for (let x = 0; x < grid.value.length; x++) {
    for (let y = 0; y < grid.value[x].length; y++) {
      const oldStatus = grid.value[x][y].getStatus();
      const newStatus = getCellStatus(x, y, gridFreezedState);
      grid.value[x][y].updateStatus(oldStatus, newStatus);
    }
  }
}

function getCellStatus(x: number, y: number, gridFreezedState: boolean[][]): boolean {
  const neighbors = checkCellNeighbors(x, y, gridFreezedState);
  if (neighbors === 3) return true;
  else if (neighbors == 2 && grid.value[x][y].getStatus()) return true;
  else return false;
}

function checkCellNeighbors(x: number, y: number, gridFreezedState: boolean[][]): number {
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
  for (const direction of directions) {
    const [dx, dy] = direction;
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < props.gridColumns && ny >= 0 && ny < props.gridRows) {
      if (gridFreezedState[nx][ny]) neighbors++;
    }
  }
  return neighbors;
}
</script>

<template>
  <div class="grid">
    <GolCanvas
      ref="golCanvas"
      :gridRows="gridRows"
      :gridColumns="gridColumns"
      :pagePercentage="pagePercentage"
      :grid="grid"
    ></GolCanvas>
  </div>
</template>

<style scoped>
.grid {
  margin-top: 1%;
  text-align: center;
}
</style>
