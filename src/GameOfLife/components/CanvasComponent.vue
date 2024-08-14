<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { gridBackgroundColor } from '@/styles/_constants';
import type { Coordinate } from '@/interfaces/GolInterface';
import type GridCell from '../classes/GridCell';
import { DrawingTool } from '../classes/DrawingTool';

const emit = defineEmits<{
  inverseGridCellStatus: [x: number, y: number]
}>()

const props = defineProps<{
  gridRows: number;
  gridColumns: number;
  pagePercentage: number;
  isPlaying: boolean;
  intervalDuration: number;
  grid: GridCell[][];
}>();

defineExpose({
  drawGrid,
  drawInitialGrid,
  updateOldGrid
});

const canvas: Ref<HTMLCanvasElement | null> = ref(null);
const canvasContext: Ref<CanvasRenderingContext2D | null> = ref(null);

let drawingTool: DrawingTool | null = null
let oldGrid: GridCell[][] = [];

onMounted(() => {
  if(!canvas.value) throw new ReferenceError('Error mounting CanvasComponent, canvas.value is null');
  canvasContext.value = canvas.value.getContext('2d');
  if(!canvasContext.value) throw new ReferenceError('Error mounting CanvasComponent, canvasContext is null');
  oldGrid = JSON.parse(JSON.stringify(props.grid));
  initScene();
  drawInitialGrid(props.grid);
})

watch(() => [props.gridRows, props.gridColumns, props.pagePercentage], () => resetScene());

watch(() => props.intervalDuration, () => drawingTool?.updateAnimationDuration(props.intervalDuration));

function initScene() {
  if(drawingTool) drawingTool.cancelAnimations();
  const { canvasValue, ctx } = validateCanvasAndContext();
  drawingTool = new DrawingTool(props.intervalDuration, ctx, calculateRadius());
  setCanvasSize(canvasValue, drawingTool);
  drawCanvasBackground();
}

function resetScene() {
  initScene();
  drawInitialGrid(props.grid);
}

function drawGrid(grid: GridCell[][]) {
  drawingTool?.requestDraw(getGridDiff(grid));
}

function drawInitialGrid(grid: GridCell[][]) {
  drawingTool?.requestDraw(getGridAlive(grid));
}

function getGridDiff(newGrid: GridCell[][]): GridCell[] {
  const diffGrid: GridCell[] = [];
  newGrid.forEach((cellArray, x) => cellArray.forEach((cell, y) => {
    if(cell.alive !== oldGrid[x][y].alive) diffGrid.push(cell);
  }))
  oldGrid = JSON.parse(JSON.stringify(newGrid));
  return diffGrid;
}

function getGridAlive(grid: GridCell[][]): GridCell[] {
  const gridAlive: GridCell[] = [];
  grid.forEach(cellArray => cellArray.forEach(cell => {
    if(cell.alive) gridAlive.push(cell);
  }));
  return gridAlive;
}

function updateOldGrid(grid: GridCell[][]) {
  drawCanvasBackground();
  oldGrid = JSON.parse(JSON.stringify(grid));
}

function setCanvasSize(canvas: HTMLCanvasElement, drawingTool: DrawingTool): void {
  canvas.width = drawingTool.getAbsolutePosition(props.gridColumns);
  canvas.height = drawingTool.getAbsolutePosition(props.gridRows);
}

function validateCanvas(): HTMLCanvasElement {
  if (!canvas.value) {
    throw new ReferenceError('Canvas is null');
  }
  return canvas.value;
}

function validateCanvasAndContext(): {
  canvasValue: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvasValue = validateCanvas();
  const ctx = canvasValue.getContext('2d');
  if (!ctx) {
    throw new ReferenceError('Canvas context is null');
  }
  return { canvasValue, ctx };
}

function calculateRadius(): number {
  return Math.ceil(((props.pagePercentage / 100) * window.innerWidth) / props.gridColumns / 2);
}

// fill the canvas with the background color
function drawCanvasBackground() {
  if(drawingTool) drawingTool.cancelAnimations();
  const { canvasValue, ctx } = validateCanvasAndContext();
  ctx.fillStyle = gridBackgroundColor;
  ctx.fillRect(0, 0, canvasValue.width, canvasValue.height);
  ctx.fill();
}

function canvasClick(event: MouseEvent) {
  if(props.isPlaying) return;
  const canvasValue = validateCanvas();
  const rect = canvasValue.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top
  const coords = getClosestCellFromClick(x, y, rect.width, rect.height);
  emit('inverseGridCellStatus', coords.x, coords.y);
}

function getClosestCellFromClick(x: number, y: number, canvasWidth: number, canvasHeight: number): Coordinate {
  const approximationCellSize = { height: canvasHeight / props.gridRows, width: canvasWidth / props.gridColumns };
  const cellPos = { x: Math.floor(x / approximationCellSize.width), y: Math.floor(y / approximationCellSize.height) };
  return cellPos;
}
</script>

<template>
  <canvas ref="canvas" @mousedown="canvasClick"></canvas>
</template>

