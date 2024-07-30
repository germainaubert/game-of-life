<script setup lang="ts">
import { watch, ref, type Ref } from 'vue';
import CanvasComponent from './CanvasComponent.vue';
import GridCell from '@/models/GridCell';

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

// grid is the source of truth of the cells state
// it is mainly used to calculate the next generation
const grid: Ref<GridCell[][]> = ref(initGrid());
// canvasComponent to draw background on grid clear
const canvasComponent: Ref<InstanceType<typeof CanvasComponent> | null> = ref(null);

const defaultIntervalDuration = 1000;
const intervalDuration: Ref<number> = ref(defaultIntervalDuration);

let intervalId: number | undefined = undefined;

watch(() => [props.gridColumns, props.gridRows], () => reset());

watch(() => props.isPlaying, (isPlaying: boolean) => handleInterval(isPlaying));

function handleInterval(isPlaying: boolean) {
  if (isPlaying) {
    intervalId = setInterval(() => {
      nextGeneration();
    }, intervalDuration.value);
  } else if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

function reset() {
  intervalDuration.value = defaultIntervalDuration;
  resetGrid();
}

function initGrid(): GridCell[][] {
  return Array.from({ length: props.gridColumns }, (_, x) =>
    Array.from({ length: props.gridRows }, (_, y) => new GridCell(x, y))
  );
}

function resetGrid() {
  const newGrid = initGrid();
  grid.value.length = 0;
  newGrid.forEach(cellArray => grid.value.push(cellArray));
}

function randomizeGrid(): void {
  grid.value.forEach(cellArray => cellArray.forEach(cell => cell.setRandomizedStatus()));
}

function clearGrid(): void {
  grid.value.forEach(cellArray => cellArray.forEach(cell => cell.alive = false));
  if(canvasComponent.value) canvasComponent.value.drawCanvasBackground();
}

function slowSim() {
  intervalDuration.value = intervalDuration.value * 2;
  simGenerationIntervalUpdated();
}

function accelerateSim() {
  intervalDuration.value = intervalDuration.value / 2;
  simGenerationIntervalUpdated()
}

function simGenerationIntervalUpdated() {
  clearInterval(intervalId);
  handleInterval(props.isPlaying);
}

// fix updateStatus 
function nextGeneration() {
  const gridFreezedState = grid.value.map(cellArray => cellArray.map(cell => cell.alive));
  for (let x = 0; x < grid.value.length; x++) {
    for (let y = 0; y < grid.value[x].length; y++) {
      grid.value[x][y].alive = processCellStatus(x, y, gridFreezedState);
    }
  }
}

function processCellStatus(x: number, y: number, gridFreezedState: boolean[][]): boolean {
  const neighbors = checkCellNeighbors(x, y, gridFreezedState);
  if (neighbors === 3) return true;
  else if (neighbors == 2 && grid.value[x][y].alive) return true;
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

function inverseCellStatus(x: number, y: number) {
  grid.value[x][y].alive = !grid.value[x][y].alive; 
}
</script>

<template>
  <div class="grid">
    <CanvasComponent
      ref="canvasComponent"
      :gridRows="gridRows"
      :gridColumns="gridColumns"
      :pagePercentage="pagePercentage"
      :isPlaying="isPlaying"
      :intervalDuration="intervalDuration"
      :grid="grid"
      @inverseGridCellStatus="inverseCellStatus"
    >
    </CanvasComponent>
  </div>
</template>

<style scoped>
.grid {
  margin-top: 1%;
  text-align: center;
}
</style>
