<script setup lang="ts">
import { watch, ref, type Ref } from 'vue';
import CanvasComponent from './CanvasComponent.vue';
import GridCell from '@/GameOfLife/classes/GridCell';

const props = defineProps<{
  gridRows: number;
  gridColumns: number;
  pagePercentage: number;
  isPlaying: boolean;
}>();

defineExpose({
  nextGeneration,
  reset,
  slowSim,
  accelerateSim,
  clearGrid
});

// grid is the source of truth of the cells state
// it is mainly used to calculate the next generation
let grid: GridCell[][] = initGrid();
// canvasComponent to draw background on grid clear
const canvasComponent: Ref<InstanceType<typeof CanvasComponent> | null> = ref(null);

const defaultIntervalDuration = 1000;
const intervalDuration: Ref<number> = ref(defaultIntervalDuration);

let intervalId: number | undefined = undefined;

watch(() => [props.gridColumns, props.gridRows], () => reset());

watch(() => props.isPlaying, (isPlaying: boolean) => handleInterval(isPlaying));

function handleInterval(isPlaying: boolean) {
  if (isPlaying) {
    intervalId = window.setInterval(() => {
      nextGeneration();
    }, intervalDuration.value);
  } else if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

function initGrid(): GridCell[][] {
  return Array.from({ length: props.gridColumns }, (_, x) =>
    Array.from({ length: props.gridRows }, (_, y) => new GridCell(x, y))
  );
}

function reset() {
  intervalDuration.value = defaultIntervalDuration;
  grid = initGrid();
  updateCanvasOldGrid();
  drawGrid(true);
}

function clearGrid(): void {
  grid.forEach(cellArray => cellArray.forEach(cell => cell.alive = false));
  updateCanvasOldGrid();
}

function drawGrid(initialDraw: boolean) {
  const canvasComp = validateCanvasComponent();
  if(initialDraw) canvasComp.drawInitialGrid(grid);
  else canvasComp.drawGrid(grid);
}

function updateCanvasOldGrid() {
  const canvasComp = validateCanvasComponent(); 
  canvasComp.updateOldGrid(grid);
}

function validateCanvasComponent() {
  if(!canvasComponent.value) throw new ReferenceError('canvasComponent.value is null');
  return canvasComponent.value;
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
  const gridFreezedState: GridCell[][] = JSON.parse(JSON.stringify(grid));
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      grid[x][y].alive = processCellStatus(x, y, gridFreezedState);
    }
  }
  drawGrid(false);
}

function processCellStatus(x: number, y: number, gridFreezedState: GridCell[][]): boolean {
  const neighbors = checkCellNeighbors(x, y, gridFreezedState);
  if (neighbors === 3) return true;
  else if (neighbors == 2 && grid[x][y].alive) return true;
  else return false;
}

function checkCellNeighbors(x: number, y: number, gridFreezedState: GridCell[][]): number {
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
      if (gridFreezedState[nx][ny].alive) neighbors++;
    }
  }
  return neighbors;
}

function inverseCellStatus(x: number, y: number) {
  grid[x][y].alive = !grid[x][y].alive; 
  drawGrid(false);
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
