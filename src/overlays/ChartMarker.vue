<template>
  <div ref="markerRef" :class="[tourStep === 1 ? 'z-[2000]' : 'z-[5]']" class="absolute isolate w-0 pointer-events-none" :style="`left: ${leftPx}px; top: ${config.top}px; opacity: ${config.opacity}`">
    
    <svg Arrow width="24" height="12" viewBox="0 0 24 12" class="absolute top-0 overflow-visible -translate-y-1/2 -translate-x-1/2 z-[2]">
      <path :d="arrowPath" fill="white" stroke="rgb(148 163 184 / 0.6)" stroke-width="1" />
    </svg>

    <div ref="boxRef" :style="[boxStyles]" class="text-center z-[1] whitespace-nowrap px-1 py-2 flex flex-col shadow bg-white border border-slate-400/60 rounded">
      <div class="font-bold border-b border-slate-300/60 px-3 pb-1 mb-1">{{ dayjs.utc(item.date).format('MMM D, YYYY') }}</div>
      <div class="text-slate-400  px-3">{{isLeft ? 'Bought ' : 'Exited '}} at ${{ addCommas(formatPrice(item.price)) }}</div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';
import { storeToRefs } from 'pinia';
import { formatPrice, addCommas } from '../lib/BasicUtils';
import { useBasicStore } from '../store';

const basicStore = useBasicStore();
const { tourStep } = storeToRefs(basicStore);

dayjs.extend(dayjsUtc);

const props = defineProps<{
  config: any,
  direction: 'left' | 'right',
  verticalOffset?: number,
}>();

const emit = defineEmits<{ (e: 'bounds', bounds: { left: number; right: number; top: number; bottom: number; viewportHeight: number }): void }>();

const markerRef = Vue.ref<HTMLElement | null>(null);
const boxRef = Vue.ref<HTMLElement | null>(null);
const isLeft = props.direction === 'left';
const opensLeft = Vue.ref(isLeft);
const item = Vue.computed(() => props.config.item);
const leftPx = Vue.computed(() => props.config.left + (opensLeft.value ? -3 : 7));
const arrowPath = Vue.computed(() => {
  const tipX = opensLeft.value ? 18 : 6;
  const baseX = opensLeft.value ? 6 : 18;
  const offset = props.verticalOffset ?? 0;
  return `M${baseX} ${offset} L${tipX} 6 L${baseX} ${offset + 12}`;
});
const boxStyles = Vue.computed<Vue.CSSProperties>(() => ({
  position: 'absolute',
  top: `${props.verticalOffset ?? 0}px`,
  left: opensLeft.value ? undefined : '5px',
  right: opensLeft.value ? 'calc(100% + 5px)' : undefined,
  transform: 'translateY(-50%)',
}));

async function updatePlacement() {
  if (!markerRef.value || !boxRef.value) return;

  const marker = markerRef.value.getBoundingClientRect();
  const width = boxRef.value.getBoundingClientRect().width;
  const anchorLeft = marker.left - (opensLeft.value ? -3 : 7);
  const spaceLeft = anchorLeft - 3 - 15;
  const spaceRight = document.documentElement.clientWidth - (anchorLeft + 7) - 15;
  const requiredSpace = width + 5;

  // Prefer the original side whenever it fits, regardless of the current placement.
  opensLeft.value = isLeft
    ? spaceLeft >= requiredSpace || spaceLeft > spaceRight
    : spaceRight < requiredSpace && spaceLeft > spaceRight;

  await Vue.nextTick();
  if (!boxRef.value) return;
  const box = boxRef.value.getBoundingClientRect();
  const offset = props.verticalOffset ?? 0;
  // Report the unshifted position so collision resolution does not feed back on itself.
  emit('bounds', { left: box.left, right: box.right, top: box.top - offset,
    bottom: box.bottom - offset, viewportHeight: document.documentElement.clientHeight });
}

Vue.watch(() => [props.config.left, props.config.top, item.value.date, item.value.price], updatePlacement, { flush: 'post' });

let resizeObserver: ResizeObserver | undefined;
Vue.onMounted(() => {
  updatePlacement();
  resizeObserver = new ResizeObserver(updatePlacement);
  if (boxRef.value) resizeObserver.observe(boxRef.value);
  if (markerRef.value?.parentElement) resizeObserver.observe(markerRef.value.parentElement);
  window.addEventListener('resize', updatePlacement);
});

Vue.onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', updatePlacement);
});

</script>

<style lang="scss" scoped>
  
</style>
