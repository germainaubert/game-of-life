<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { cellAliveColor, gridBackgroundColor } from '@/utils/cssConstants';

const props = defineProps<{
  x: number;
  y: number;
  alive: boolean;
  radius: number;
  diameter: number;
  intervalDuration: number;
  cancelAnimation: boolean;
  ctx: CanvasRenderingContext2D | null;
}>();

const animationDuration = computed<number>(() => Math.round(props.intervalDuration * 0.3));
const getRectX = computed<number>(() => getAbsolutePosition(props.x));
const getRectY = computed<number>(() => getAbsolutePosition(props.y));
const padding = computed<number>(() => Math.ceil(0.5 * props.radius));

let animationStartTime: number | null = null
let animationRadius: number = 0;
let animationId: number | null = null;

onMounted(() => {
  animationRadius = props.alive ? props.radius : 0;
  requestAnimation();
})

watch(() => [props.alive, props.radius], () => {
  if(animationId) cancelAnimationFrame(animationId);
  animationRadius = props.alive ? props.radius : 0;
  animationStartTime = 0;
  requestAnimation();
}, { immediate: true });

function drawCell() {
  // if cell is dying clear the zone, also prevents antialiazing exceeding

  if(!props.ctx) throw new ReferenceError('Unable to draw cell, canvas context is undefined');
  props.ctx.fillStyle = gridBackgroundColor;
  props.ctx.fillRect(
    getRectX.value,
    getRectY.value,
    props.diameter + padding.value,
    props.diameter + padding.value
  );

  props.ctx.beginPath();
  props.ctx.shadowColor = 'transparent';
  props.ctx.arc(
    getCellCircleCenter(props.x),
    getCellCircleCenter(props.y),
    animationRadius,
    0,
    2 * Math.PI
  );
  props.ctx.lineWidth = 0;
  props.ctx.fillStyle = cellAliveColor;
  props.ctx.fill();
}

function animateCell(timeStamp: number): void {
  if(animationDuration.value > 0) {
    if(!animationStartTime) {
      animationStartTime = timeStamp;
    }
    const elapsed = timeStamp - animationStartTime;
    const progress = Math.min(elapsed / animationDuration.value, 1);
    if(props.alive) animationRadius = props.radius * progress;
    else animationRadius = props.radius * (1 - progress);

    if(progress < 1) {
      requestAnimation();
    }
  }
  drawCell();
}

function requestAnimation() {
  animationId = requestAnimationFrame(animateCell);
}

function getAbsolutePosition(position: number): number {
  return (padding.value + props.diameter) * position;
}

function getCellCircleCenter(position: number): number {
  return getAbsolutePosition(position) + getCellPositionOffset();
}

function getCellPositionOffset(): number {
  return props.radius + props.radius / 4;
}
</script>
<template>
  <div></div>
</template>