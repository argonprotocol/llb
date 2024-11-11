<template>
  <ChartOpaque :style="chartOpaqueStyle" class="absolute top-0 bottom-[47px] z-[500]" />
  <div SelectedLine @mousedown="emitMousedown" @touchstart="emitTouchstart" :style="`left: ${posLeft}px; top: ${posTopPct}%`" :class="lineClasses" class="absolute bottom-3 z-[500] cursor-col-resize">
    <div class="Selected"></div>
    <div NibWrapper class="absolute left-1/2 bottom-0.5 ml-[1.5px] w-[26.5px] h-6 -translate-x-1/2 translate-y-1/2">
      <TriangleNib class="absolute left-0 bottom-0 w-[24.5px] h-6 cursor-grab" />
      <TriangleNibBasic class="Selected absolute left-[2.5px] bottom-1 w-[18px] h-4 pointer-events-none" />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import TriangleNib from '../assets/triangle-nib.svg';
import TriangleNibBasic from '../assets/triangle-nib-basic.svg';
import ChartOpaque from './ChartOpaque.vue';

const props = defineProps<{
  position: 'left' | 'right';
  pos: number;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void
  (e: 'touchstart', event: TouchEvent): void
}>();

const posLeft = Vue.computed(() => props.pos);
const posTopPct = Vue.computed(() => {
  const viewportWidth = window.innerWidth;
  const leftPct = (props.pos / viewportWidth) * 100;
  const noAdjustmentAfter = 70;

  if (leftPct < 40) {
    return 80;
  } else if (leftPct > noAdjustmentAfter) {
    return 20;
  } else {
    const scale = (leftPct - 40) / (noAdjustmentAfter - 40); // 0 to 1
    return 80 - (scale * (80 - 20)); // Scale between 80 and 20
  }
});

const lineClasses = Vue.computed(() => {
  return {
    isActive: props.isActive,
    Left: props.position === 'left',
    Right: props.position === 'right',
  };
});

const chartOpaqueStyle = Vue.computed(() => {
  if (props.position === 'left') {
    return { width: `${props.pos - 10}px`, left: '10px' };
  } else {
    return { left: `${props.pos}px`, right: '0px' };
  }
});

function emitMousedown(event: MouseEvent) {
  emit('mousedown', event);
}

function emitTouchstart(event: TouchEvent) {
  emit('touchstart', event);
}
</script>

<style lang="scss" scoped>

[SelectedLine] {
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50px);
    width: 4px;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: -2px;
      width: 2px;
      background: linear-gradient(to bottom, rgba(30, 41, 59, 0), rgba(30, 41, 59, 0.4) 50px);
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: -2px;
      width: 2px;
      background: linear-gradient(to bottom, rgba(30, 41, 59, 0), rgba(30, 41, 59, 0.4) 50px);
      z-index: -1;
    }
    div.Selected {
      display: none;
      position: absolute;
      width: 2px;
      left: 1px;
      top: 0;
      height: 100%;
      background: linear-gradient(to bottom, rgba(204, 136, 255, 0), rgb(204, 136, 255) 50px);
    }

    svg.Selected {
      display: none;
    }
    &.isActive {
      svg.Selected {
        display: block;
      }
      div.Selected {
        display: block;
      }
    }

    &.Left {
      box-shadow: -1px 0 4px 0px rgba(0, 0, 0, .1);
    }

    &.Right {
      box-shadow: 1px 0 4px 0px rgba(0, 0, 0, .1);
    }
  }

</style>