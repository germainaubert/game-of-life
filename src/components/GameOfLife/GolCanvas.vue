<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';
import type { CellDisplayInfo, Coordinate } from './GolInterface';

const props = defineProps<{
  gridRows: number;
  gridColumns: number;
  pagePercentage: number;
  grid: boolean[][]
}>();

const emit = defineEmits(['switchCellState']);

const cellDisplayInfo: CellDisplayInfo = {
  positionOffset: 40,
  radius: 20,
  diameter: 40,
  padding: 5,
  getCellCenterPosition(position: number) {
    return this.padding * position + this.diameter * position + this.positionOffset;
  }
};

const canvas: Ref<HTMLCanvasElement | null> = ref(null);

// default css values, real values are set onMounted
let gridBackgroundColor: string = '#969696';
let cellAliveColor: string = '#424242';
let gridLineColor: string = '#969595';
let gridLineShadowColor: string = '#bfbfbf';

onMounted(() => {
  window.addEventListener('resize', resize);
  gridBackgroundColor = getComputedStyle(document.body).getPropertyValue('--grid-background-color');
  cellAliveColor = getComputedStyle(document.body).getPropertyValue('--cell-alive-color');
  gridLineColor = getComputedStyle(document.body).getPropertyValue('--grid-line-color');
  gridLineShadowColor = getComputedStyle(document.body).getPropertyValue('--grid-line-shadow-color');
  resize();
});

onUnmounted(() => {
  window.removeEventListener('resize', resize);
});

watch(() => [props.gridRows, props.gridColumns], () => {
  resize()
})

watch(() => props.grid, () => {
  drawGrid()
})

function setCellDisplayInfo(): void {
  cellDisplayInfo.radius = Math.ceil(((props.pagePercentage / 100) * window.innerWidth) / props.gridColumns / 2);
  cellDisplayInfo.padding = Math.ceil((50 / 100) * cellDisplayInfo.radius);
  cellDisplayInfo.positionOffset = cellDisplayInfo.radius + cellDisplayInfo.radius / 4;
  cellDisplayInfo.diameter = cellDisplayInfo.radius * 2;
}

// optimization needed: change from redraw every tick to -> draw only what have changed
function drawGrid(): void {
  const { canvasValue, ctx } = validateCanvasAndContext();
  ctx.fillStyle = gridBackgroundColor;
  ctx.fillRect(0, 0, canvasValue.width, canvasValue.height);
  for (let x = 0; x < props.gridColumns; x++) {
    drawLine(cellDisplayInfo.getCellCenterPosition(x) + cellDisplayInfo.radius + cellDisplayInfo.padding / 2, 0, cellDisplayInfo.getCellCenterPosition(x) + cellDisplayInfo.radius + cellDisplayInfo.padding / 2, canvasValue.height);
    for (let y = 0; y < props.gridRows; y++) {
      if(x === 0) drawLine(0, cellDisplayInfo.getCellCenterPosition(y) + cellDisplayInfo.radius + cellDisplayInfo.padding / 2, canvasValue.width, cellDisplayInfo.getCellCenterPosition(y) + cellDisplayInfo.radius + cellDisplayInfo.padding / 2);
      const color = props.grid[x][y] ? cellAliveColor : gridBackgroundColor;
      drawCell(color, ctx, x, y);
    }
  }
}

function drawCell(
  color: string,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  cellDisplayInfo.getCellCenterPosition(y)
  ctx.beginPath();
  ctx.shadowColor = 'transparent';
  ctx.arc(
    cellDisplayInfo.getCellCenterPosition(x),
    cellDisplayInfo.getCellCenterPosition(y),
    cellDisplayInfo.radius,
    0,
    2 * Math.PI
  );
  ctx.lineWidth = 0;
  ctx.fillStyle = color;
  ctx.fill();
}

function setCanvasSize(): void {
  const canvasValue = validateCanvas();
  canvasValue.width = cellDisplayInfo.padding * props.gridColumns + cellDisplayInfo.diameter * props.gridColumns;
  canvasValue.height = cellDisplayInfo.padding * props.gridRows + cellDisplayInfo.diameter * props.gridRows;
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
  const clickPos: Coordinate = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  const closestCell = getClosestCellFromClick(clickPos, rect.width, rect.height);
  emit('switchCellState', closestCell);
}

function getClosestCellFromClick(clickPos: Coordinate, canvasWidth: number, canvasHeight: number): Coordinate {
  const approximationCellSize = { height: canvasHeight / props.gridRows, width: canvasWidth / props.gridColumns};
  const cellPos = { x: Math.floor(clickPos.x / approximationCellSize.width), y: Math.floor(clickPos.y / approximationCellSize.height) };
  return cellPos;
}

function resize(): void {
  setCellDisplayInfo();
  setCanvasSize();
  drawGrid();
}

function drawLine(x: number, y: number, destX: number, destY: number) {
  const { ctx } = validateCanvasAndContext();
  ctx.beginPath();
  ctx.shadowColor = gridLineShadowColor;
  ctx.strokeStyle = gridLineColor;
  ctx.shadowBlur = 4;
  ctx.moveTo(x, y);
  ctx.lineTo(destX, destY);
  ctx.stroke();
}

</script>
<template>
  <canvas ref="canvas" class="canvas" @click="canvasClick"></canvas>
</template>

