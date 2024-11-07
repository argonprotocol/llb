<template>
  <div class="absolute z-[1000] pointer-events-none" :style="`left: ${config.left}px; top: ${config.top}px; opacity: ${config.opacity}`">
    
    <div Arrow ref="arrowRef" class="relative transform -translate-x-1/2 -translate-y-[100%] -mt-1 rotate-180 z-1">
      <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="white"/>
      </svg>
      <svg class="absolute z-0 -top-0.5 left-[-1.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="black"/>
      </svg>
    </div>

    <div ref="boxRef" :style="`transform: translateX(${boxConfig.translateX}%)`" class="absolute left-0 bottom-[23px] z-0 whitespace-nowrap flex flex-col shadow-lg bg-white border border-slate-400/60 rounded-lg">
      <table class="mx-3">
        <thead>
          <tr>
            <th colspan="3" class="text-left">{{ dayjs.utc(item.date).format('MMMM D, YYYY') }}</th>
          </tr>
        </thead>
        <tbody class="align-middle">
            <tr>
              <td class="text-left opacity-50 pr-2">Price Per Bitcoin</td>
              <td class="text-right font-bold">${{ addCommas(formatPrice(item.price)) }}</td>
              <td>
                <span v-if="priceDiff" class="font-normal relative" :class="priceDiff > 0 ? 'text-green-700' : 'text-red-500'">
                  <span class="font-light">(</span><span class="font-bold">{{priceDiff > 0 ? '+' : '' }}{{ addCommas(priceDiff) }}%<span class="font-light">)</span></span>
                </span>
                <span v-else class="font-bold text-slate-400"><span class="font-light">(</span>0%<span class="font-light">)</span></span>
              </td>
            </tr>
        </tbody>
      </table>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';
import { addCommas, formatShorthandNumber, formatPrice, formatChangePct } from '../lib/BasicUtils';

dayjs.extend(dayjsUtc);

const props = defineProps<{
  config: any
}>();

const item = Vue.ref(props.config.item);

const arrowRef: Vue.Ref<HTMLElement | null> = Vue.ref(null);
const boxRef: Vue.Ref<HTMLElement | null> = Vue.ref(null);
const boxConfig = Vue.ref({ translateX: 50 });

const priceDiff = Vue.ref(0);

function updateBoxPosition() {
  const arrowRect = arrowRef.value?.getBoundingClientRect() || { left: 0};
  const boxRect = boxRef.value?.getBoundingClientRect() || { left: 0};
  const boxWidth = boxRect.width || 0;
  const halfBoxWidth = boxWidth / 2;
  const arrowLeft = arrowRect.left + (arrowRect.width / 2);
  const windowWidth = window.innerWidth

  if (arrowLeft <= halfBoxWidth) {
    const moveLeftPx = halfBoxWidth - arrowLeft;
    const moveLeftPct = -50 * (1 - (moveLeftPx / halfBoxWidth));
    boxConfig.value.translateX = moveLeftPct;
  } else if ((windowWidth - arrowLeft) < halfBoxWidth) {
    const moveRightPx = windowWidth - arrowLeft;
    const moveRightPct = -50 * (1 - (moveRightPx / halfBoxWidth));
    boxConfig.value.translateX = -50 + moveRightPct;
  } else {
    boxConfig.value.translateX = -50;
  }
}

Vue.watch(props.config, () => {
  updateBoxPosition();
  setTimeout(() => updateBoxPosition, 100);

  item.value = props.config.item;
  updateItemsDiffs()
});

function updateItemsDiffs() {
  const previousPrice = item.value.previous.price;
  const currentPrice = item.value.price;
  if (!previousPrice || !currentPrice) {
    return;
  }
  priceDiff.value = formatChangePct((currentPrice - previousPrice) / previousPrice);
}

</script>

<style lang="scss" scoped>
  table {
    @apply mb-1;
    thead tr {
      @apply border-b border-slate-200;
    }
    thead th {
      @apply py-2;
    }
    td {
      @apply py-0.5;
    }
    tbody tr {
      @apply border-b border-slate-200;
      &:last-child {
        @apply border-none;
      }
    }
    svg {
      @apply w-4 h-4;
    }
  }
</style>