<template>
  <div ref="box" v-show="config.opacity && config.item?.date" class="chart-tip absolute z-[5] pointer-events-none rounded-lg border border-slate-300 bg-white shadow-lg p-3 text-sm" :style="{ left: left + 'px', top: top + 'px' }">
    <strong>{{ dayjs.utc(config.item?.date).format('MMM D, YYYY') }}</strong>
    <dl class="grid grid-cols-2 gap-2 mt-1"><dt>BTC price</dt><dd class="text-right">${{ currency(config.item?.price || 0) }}<small class="block text-slate-500">{{ difference('price') }}</small></dd><dt>Transaction fee</dt><dd class="text-right">${{ currency(config.item?.fee || 0) }}<small class="block text-slate-500">{{ difference('fee') }}</small></dd></dl>
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { currency, formatChangePct } from '../lib/BasicUtils';
const props = defineProps<{ config: { opacity: number; left: number; top: number; item: any } }>();
const box = ref<HTMLElement | null>(null);
const left = ref(8);
const top = ref(8);
function difference(field: 'price' | 'fee') {
  const previous = props.config.item?.previous?.[field];
  if (!previous) return '';
  const change = formatChangePct((props.config.item[field] - previous) / previous);
  return `${change > 0 ? '+' : ''}${change}% from prior day`;
}
watch(() => [props.config.left, props.config.top, props.config.opacity, props.config.item], async () => {
  await nextTick();
  const element = box.value;
  const parent = element?.parentElement;
  if (!element || !parent) return;
  left.value = Math.max(8, Math.min(props.config.left - element.offsetWidth / 2, parent.clientWidth - element.offsetWidth - 8));
  top.value = Math.max(8, Math.min(props.config.top - element.offsetHeight - 12, parent.clientHeight - element.offsetHeight - 45));
}, { flush: 'post' });
</script>
<style scoped>
.chart-tip { width: 240px; max-width: calc(100% - 16px); overflow-wrap: anywhere; }
</style>
