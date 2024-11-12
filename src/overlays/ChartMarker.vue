<template>
  <div class="absolute z-50 pointer-events-none" :style="`left: ${leftPx}px; top: ${topPx}px; opacity: ${config.opacity}`">
    
    <div Arrow ref="arrowRef" :style="{'--tw-rotate': `${rotationDegree}deg`, 'left': `${arrowLeft}px`}" class="relative -translate-y-1/2 -translate-x-1/2 mt-[-0.5px] z-1">
      <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="white"/>
      </svg>
      <svg class="absolute z-0 -top-0.5 left-[-1.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="black"/>
      </svg>
    </div>

    <div ref="boxRef" :style="[boxStyles]" class="text-center z-0 whitespace-nowrap px-1 py-2 flex flex-col shadow bg-white border border-slate-400/60 rounded">
      <div class="font-bold border-b border-slate-300/60 px-3 pb-1 mb-1">{{ dayjs.utc(item.date).format('MMM D, YYYY') }}</div>
      <div class="text-slate-400  px-3">{{isLeft ? 'Bought ' : 'Exited '}} at ${{ addCommas(formatPrice(item.price)) }}</div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';
import { formatPrice, addCommas } from '../lib/BasicUtils';

dayjs.extend(dayjsUtc);

const props = defineProps<{
  config: any,
  direction: 'left' | 'right',
}>();

const arrowRef: Vue.Ref<HTMLElement | null> = Vue.ref(null);
const arrowLeft = Vue.ref(0);

const boxRef: Vue.Ref<HTMLElement | null> = Vue.ref(null);
const boxOverride = Vue.ref({ left: 0, top: 0, arrowLeft: 0, isResetting: false });

const isLeft = props.direction === 'left';
const rotationDegree = Vue.ref(isLeft ? 90 : -90);

const item = Vue.computed(() => {
  return props.config.item;
});

const topPx = Vue.computed(() => {
  if (boxOverride.value.top) {
    boxOverride.value.top = props.config.top + 16;
  }
  return props.config.top;
});

function checkLeftBoxPosition(left: number, boxRect: DOMRect) {
  if (!boxRect) return;
  if (left > window.innerHeight / 2) return;

  const isTooFarLeft = boxRect.left > -100 && boxRect.left <= 5;

  if (isTooFarLeft && !boxOverride.value.isResetting) {
    if (!boxOverride.value.left) {
      boxOverride.value.left = 5;
      boxOverride.value.top = boxRect.top + 10;
      boxOverride.value.arrowLeft = arrowRef.value?.getBoundingClientRect().left || 0;
    } else {
      const arrowLeft = arrowRef.value?.getBoundingClientRect().left || 0;
      if (arrowLeft > boxOverride.value.arrowLeft) {
        boxOverride.value = { left: 0, top: 0, arrowLeft: 0, isResetting: true };
      }
    }
  } else if (boxRect.left > 5) {
    boxOverride.value = { left: 0, top: 0, arrowLeft: 0, isResetting: false };
  }
}

function checkRightBoxPosition(left: number, boxRect: DOMRect) {
  if (!boxRect) return;
  if (left < window.innerHeight / 2) return;

  const isTooFarRight = boxRect.right >= window.innerWidth - 15;

  if (isTooFarRight && !boxOverride.value.isResetting) {
    console.log('isTooFarRight', isTooFarRight, boxOverride.value.left);

    if (!boxOverride.value.left) {
      boxOverride.value.left = window.innerWidth - boxRect.width - 15;
      boxOverride.value.top = boxRect.top + 10;
      boxOverride.value.arrowLeft = arrowRef.value?.getBoundingClientRect().right || 0;
      console.log('SET arrowLeft', boxOverride.value.arrowLeft);
    } else {
      const arrowLeft = arrowRef.value?.getBoundingClientRect().right || 0;
      if (arrowLeft < boxOverride.value.arrowLeft) {
        console.log('LEFT arrowLeft', arrowLeft);
        boxOverride.value = { left: 0, top: 0, arrowLeft: 0, isResetting: true };
      }
    }
  } else if (boxRect.right < window.innerWidth - 20) {
    console.log('RESET');
    boxOverride.value = { left: 0, top: 0, arrowLeft: 0, isResetting: false };
  } 
}

const leftPx = Vue.computed(() => {
  const left = props.config.left + (isLeft ? -3 : 7);
  const boxRect = boxRef.value?.getBoundingClientRect();

  if (boxRect) {
    checkLeftBoxPosition(left, boxRect);
    checkRightBoxPosition(left, boxRect);
  }

  return left;
});

const boxStyles = Vue.computed(() => {
  if (boxOverride.value.left) {
    rotationDegree.value = 180;
    arrowLeft.value = -5;
    return { 
      position: 'fixed', 
      left: `${boxOverride.value.left}px`, 
      top: `${boxOverride.value.top}px`,
      transform: 'translateY(-60%)',
    };
  }
  
  rotationDegree.value = isLeft ? 90 : -90;
  arrowLeft.value = 0;

  return {
    position: 'absolute',
    top: 0,
    ...(isLeft ? { right: '119%' } : { left: '20%' }),
    transform: 'translateY(-60%)',
  };
});

</script>

<style lang="scss" scoped>
  
</style>