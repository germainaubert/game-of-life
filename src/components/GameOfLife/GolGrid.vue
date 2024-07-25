<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue';
import GolCanvas from './GolCanvas.vue';
import type { Ref } from 'vue';
import type { Coordinate, DrawingCellInfo } from '../../interfaces/GolInterface';

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
});

let grid: boolean[][] = []; // 2D array, true == alive, false == dead
const cellsToDraw: Ref<DrawingCellInfo[]> = ref([]);
const canvas: Ref<InstanceType<typeof GolCanvas> | null> = ref(null);

const defaultIntervalDuration = 1000;
let intervalDuration = defaultIntervalDuration;
let intervalId: number | undefined = undefined;

onBeforeMount(() => {
  reset();
});

watch(
  () => [props.gridColumns, props.gridRows],
  () => {
    reset();
  }
);

onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
});

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

function resizeCanvas() {
  const toDraw: DrawingCellInfo[] = [];
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if(grid[x][y]) toDraw.push((getCellToDraw(x, y, grid[x][y])));
    }
  }
  cellsToDraw.value = toDraw;
}

function reset() {
  intervalDuration = defaultIntervalDuration;
  initGrid();
  randomizeGrid();
}

function initGrid(): void {
  grid = Array.from({ length: props.gridColumns }, () =>
    Array.from({ length: props.gridRows }, () => false)
  );
}

function getCellToDraw(x: number, y: number, status: boolean): DrawingCellInfo {
  return {
    coords: {
      x,
      y
    },
    status: status
  };
}

function randomizeGrid(): void {
  const toDraw: DrawingCellInfo[] = [];
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      grid[x][y] = (() => {
        if (Math.random() > 0.3) return false;
        else return true;
      })();
      toDraw.push(getCellToDraw(x, y, grid[x][y]));
    }
  }
  cellsToDraw.value = toDraw;
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

function nextGeneration() {
  const toDraw: DrawingCellInfo[] = [];
  const newGrid = JSON.parse(JSON.stringify(grid));
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const oldStatus = newGrid[x][y];
      newGrid[x][y] = getCellStatus(x, y);
      // add cell to draw if state has changed
      const newStatus = newGrid[x][y];
      if(oldStatus != newStatus) toDraw.push(getCellToDraw(x, y, newStatus));
    }
  }
  grid = newGrid;
  cellsToDraw.value = toDraw;
}

function getCellStatus(x: number, y: number): boolean {
  const neighbors = checkCellNeighbors(x, y);
  if (neighbors === 3) return true;
  else if (neighbors == 2 && grid[x][y]) return true;
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
  for (const direction of directions) {
    const [dx, dy] = direction;
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < props.gridColumns && ny >= 0 && ny < props.gridRows) {
      if (grid[nx][ny]) neighbors++;
    }
  }
  return neighbors;
}

function switchCellState(cellPos: Coordinate): void {
  const newStatus = !grid[cellPos.x][cellPos.y];
  grid[cellPos.x][cellPos.y] = newStatus;
  console.log(cellPos.x, cellPos.y, newStatus);
  cellsToDraw.value = [getCellToDraw(cellPos.x, cellPos.y, newStatus)];
}
</script>

<template>
  <div class="grid">
    <GolCanvas
      ref="gol-canvas"
      :gridRows="gridRows"
      :gridColumns="gridColumns"
      :pagePercentage="pagePercentage"
      :cellsToDraw="cellsToDraw"
      @switchCellState="switchCellState"
    ></GolCanvas>
  </div>
</template>

<style scoped>
.grid {
  margin-top: 1%;
  text-align: center;
}
</style>
