<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import type { Coordinate, DrawingCellInfo } from '../../interfaces/GolInterface';
import { getCSSConstants } from '@/utils/cssConstants';
import CanvasTool from '@/models/CanvasTool';

const props = defineProps<{
  gridRows: number;
  gridColumns: number;
  pagePercentage: number;
  cellsToDraw: DrawingCellInfo[];
}>();

const emit = defineEmits(['switchCellState']);
let canvasTool = new CanvasTool(props.pagePercentage, props.gridColumns, props.gridRows); 

const canvas: Ref<HTMLCanvasElement | null> = ref(null);

// css constants
let gridBackgroundColor: string;
let cellAliveColor: string;
let gridLineColor: string;
let gridLineShadowColor: string;

onMounted(() => {
  setCSSConstants();
  resize();
});


watch(() => [props.gridRows, props.gridColumns], () => {
  resize()
})

watch(() => props.cellsToDraw, () => {
  drawCells();
})

function setCSSConstants(): void {
  ({gridBackgroundColor, cellAliveColor, gridLineColor, gridLineShadowColor} = getCSSConstants());
}

function drawScene(): void {
  drawCanvasGrid();
  drawCells();
}

function drawCells(): void {1
  const { ctx } = validateCanvasAndContext();
  for(const cell of props.cellsToDraw) {
    drawCell(cell, ctx);
  }
}

function drawCell(
  cell: DrawingCellInfo,
  ctx: CanvasRenderingContext2D
) {
  console.log("jaj")
  // clear the zone of the cell to prevent antialiazing overtaking
  ctx.fillStyle = gridBackgroundColor;
  ctx.fillRect(canvasTool.getClearRectAxisValue(cell.coords.x) - 1, canvasTool.getClearRectAxisValue(cell.coords.y) - 1, canvasTool.getCellDiameter() + 2, canvasTool.getCellDiameter() + 2);
  // draw 
  ctx.beginPath();
  ctx.shadowColor = 'transparent';
  ctx.arc(
    canvasTool.getCellCircleCenter(cell.coords.x),
    canvasTool.getCellCircleCenter(cell.coords.y),
    canvasTool.getCellRadius(),
    0,
    2 * Math.PI
  );
  ctx.lineWidth = 0;
  ctx.fillStyle = cell.status ? cellAliveColor : gridBackgroundColor;
  console.log(cell.status ? cellAliveColor : gridBackgroundColor);
  ctx.fill();
}

// draw or redraw the background color and lines
function drawCanvasGrid() {
  const { canvasValue, ctx } = validateCanvasAndContext();
  // fill with background color
  ctx.fillStyle = gridBackgroundColor;
  ctx.fillRect(0, 0, canvasValue.width, canvasValue.height);
  // loop and draw lines
  for (let x = 0; x < props.gridColumns; x++) {
    drawLine(canvasTool.getConstantLineAxis(x), 0, canvasTool.getConstantLineAxis(x), canvasValue.height);
    for (let y = 0; y < props.gridRows; y++) {
      if(x === 0) drawLine(0, canvasTool.getConstantLineAxis(y), canvasValue.width, canvasTool.getConstantLineAxis(y));
    }
  }
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
  canvasTool = new CanvasTool(props.pagePercentage, props.gridColumns, props.gridRows);
  canvasTool.setCanvasSize(validateCanvas());
  drawScene();
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
  <canvas ref="canvas" class="canvas" @mousedown="canvasClick"></canvas>
</template>

