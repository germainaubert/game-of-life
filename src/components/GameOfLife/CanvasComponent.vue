<script setup lang="ts">
import { computed, onMounted, ref, watch, type Reactive, type Ref } from 'vue';
import { gridBackgroundColor } from '@/utils/cssConstants';
import type { Coordinate } from '@/interfaces/GolInterface';
import type GridCell from '@/models/GridCell';
import CanvasCell from '@/components/GameOfLife/CanvasCell.vue'

const emit = defineEmits<{
  inverseGridCellStatus: [x: number, y: number]
}>()

const props = defineProps<{
  gridRows: number;
  gridColumns: number;
  pagePercentage: number;
  isPlaying: boolean;
  intervalDuration: number;
  grid: Reactive<GridCell[][]>;
}>();

defineExpose({
  drawCanvasBackground
});

const canvas: Ref<HTMLCanvasElement | null> = ref(null);
const canvasContext: Ref<CanvasRenderingContext2D | null> = ref(null);
const radius: Ref<number> = ref(getRadius());
const cancelAnimation: Ref<boolean> = ref(false);

const padding = computed<number>(() => Math.ceil(0.5 * radius.value));
const diameter = computed<number>(() => radius.value * 2);

onMounted(() => {
  if(!canvas.value) throw new ReferenceError('Error mounting CanvasComponent, canvas.value is null');
  canvasContext.value = canvas.value.getContext('2d');
  if(!canvasContext.value) throw new ReferenceError('Error mounting CanvasComponent, canvasContext is null');
  initScene();
})

watch(() => [props.gridRows, props.gridColumns, props.pagePercentage], () => initScene());

function initScene() {
  const { canvasValue } = validateCanvasAndContext();
  radius.value = getRadius()
  setCanvasSize(canvasValue);
  drawCanvasBackground();
}

function setCanvasSize(canvas: HTMLCanvasElement): void {
  canvas.width = getAbsolutePosition(props.gridColumns);
  canvas.height = getAbsolutePosition(props.gridRows);
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

function getAbsolutePosition(position: number): number {
  return (padding.value + diameter.value) * position;
}

function getRadius(): number {
  return Math.ceil(((props.pagePercentage / 100) * window.innerWidth) / props.gridColumns / 2);
}

// fill the canvas with the background color
function drawCanvasBackground() {
  const { canvasValue, ctx } = validateCanvasAndContext();
  ctx.fillStyle = gridBackgroundColor;
  ctx.fillRect(0, 0, canvasValue.width, canvasValue.height);
  ctx.fill();
  console.log("draw background");
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

// function drawLine(x: number, y: number, destX: number, destY: number, ctx: CanvasRenderingContext2D) {
//   ctx.beginPath();
//   ctx.strokeStyle = gridLineColor;
//   ctx.moveTo(x, y);
//   ctx.lineTo(destX, destY);
//   ctx.stroke();
// }
</script>

<template>
  <canvas ref="canvas" @mousedown="canvasClick"></canvas>
  <div v-if="canvasContext">
    <div  v-for="cellArray, index in grid" :key="index">
      <CanvasCell v-for="cell, index in cellArray" :key="index" :x="cell.x" :y="cell.y" :alive="cell.alive" :radius="radius" :diameter="diameter" :intervalDuration="intervalDuration"  :ctx="canvasContext" :cancelAnimation="cancelAnimation"></CanvasCell>
    </div>
  </div>
  
</template>

