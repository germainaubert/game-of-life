<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { gridBackgroundColor, gridLineColor } from '@/utils/cssConstants';
import CanvasTool from '@/models/CanvasTool';
import type Cell from '@/models/Cell';
import type { Coordinate } from '@/interfaces/GolInterface';

defineExpose({
  initScene,
});

const props = defineProps<{
  gridRows: number;
  gridColumns: number;
  pagePercentage: number;
  grid: Cell[][];
}>();

let canvasTool = new CanvasTool(props.pagePercentage, props.gridColumns, props.gridRows);

const canvas: Ref<HTMLCanvasElement | null> = ref(null);

onMounted(() => {
  initScene();
});

watch(() => props.grid, () => initScene())

// fill the canvas with the background color and display lines
function drawCanvasBackground(canvasValue: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  console.log("background");
  // fill with background color
  ctx.fillStyle = gridBackgroundColor;
  ctx.fillRect(0, 0, canvasValue.width, canvasValue.height);

  // loop and draw lines
  for (let x = 0; x < props.gridColumns; x++) {
    drawLine(canvasTool.getConstantLineAxis(x), 0, canvasTool.getConstantLineAxis(x), canvasValue.height, ctx);
    for (let y = 0; y < props.gridRows; y++) {
      if(x === 0) drawLine(0, canvasTool.getConstantLineAxis(y), canvasValue.width, canvasTool.getConstantLineAxis(y), ctx);
    }
  }
}

function drawCells() {
  props.grid.forEach((cellArray: Cell[]) => cellArray.forEach((cell: Cell) => cell.drawCell()))
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

function canvasClick(event: MouseEvent) {
  const { canvasValue } = validateCanvasAndContext();
  const rect = canvasValue.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top
  const coords = getClosestCellFromClick(x, y, rect.width, rect.height);
  props.grid[coords.x][coords.y].inverseStatus();
}

function getClosestCellFromClick(x: number, y: number, canvasWidth: number, canvasHeight: number): Coordinate {
  const approximationCellSize = { height: canvasHeight / props.gridRows, width: canvasWidth / props.gridColumns };
  const cellPos = { x: Math.floor(x / approximationCellSize.width), y: Math.floor(y / approximationCellSize.height) };
  return cellPos;
}

function initScene(): void {
  canvasTool = new CanvasTool(props.pagePercentage, props.gridColumns, props.gridRows);
  const { canvasValue, ctx } = validateCanvasAndContext();
  canvasTool.setCanvasSize(canvasValue);
  drawCanvasBackground(canvasValue, ctx);
  setCellDrawingTools(ctx, canvasTool);
  drawCells();
}

function setCellDrawingTools(ctx: CanvasRenderingContext2D, canvasTool: CanvasTool) {
  props.grid.forEach((cellArray: Cell[]) => cellArray.forEach((cell: Cell) => cell.setDrawingTools(ctx, canvasTool)));
}

function drawLine(x: number, y: number, destX: number, destY: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.strokeStyle = gridLineColor;
  ctx.moveTo(x, y);
  ctx.lineTo(destX, destY);
  ctx.stroke();
}

</script>
<template>
  <canvas ref="canvas" class="canvas" :canvasTool="canvasTool" @mousedown="canvasClick"></canvas>
</template>

