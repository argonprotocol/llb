<template>
  <main class="Main Component simulator" aria-label="Liquid Locking simulator">
    <div ref="chartArea" class="chart-region" @keydown="handleChartKey">
      <ChartBg />
      <Chart ref="chartRef" :date-range="store.dateDomain" :disable-tooltip="isDragging" @geometry="syncGeometry" />
      <NibSlider v-for="side in sides" :key="side" :position="side" :pos="positions[side].x" :top="desktop ? positions[side].top : 20"
        :is-active="nibsActive[side] || (desktop && highlightKind === (side === 'left' ? 'start' : 'end'))" :selected="selected === side" :value="store.sliderIndexes[side]" :value-text="store.sliderDates[side]"
        :min="store.dateDomain.indexByDate.get(store.dateDomain.bounds(side, store.sliderDates).min) || 0"
        :max="store.dateDomain.indexByDate.get(store.dateDomain.bounds(side, store.sliderDates).max) || store.dateDomain.dates.length - 1"
        @select="selectEndpoint(side)" @pointerdown="startDrag(side, $event)" @pointermove="onDrag" @pointerup="finishDrag" @pointercancel="cancelDrag" />
      <template v-if="desktop && geometryReady">
        <ChartMarker v-for="side in sides" :key="side" :direction="side" :config="markers[side]" :vertical-offset="tooltipOffsets[side]" @bounds="bounds[side] = $event" />
      </template>
      <div v-if="desktop && highlightPosition && (highlightKind === 'ratchet' || highlightKind === 'short')" class="activity-marker absolute pointer-events-none -translate-x-1/2" :style="{ left: highlightPosition.x + 'px', top: highlightPosition.y - 200 + 'px', height: '200px' }">
        <ArgonIcon v-if="highlightKind === 'short'" class="w-6 h-6 relative z-30" />
        <LockIcon v-else class="w-4 h-4 relative z-30" />
        <div class="activity-line absolute left-1/2 bottom-0 w-px" :style="{ top: highlightKind === 'short' ? '28px' : '24px' }" />
      </div>
    </div>

    <DesktopLayout v-if="desktop" />
    <MobileLayout v-else :selected="selected" @select="selectEndpoint" @key="handleEndpointKey" />
  </main>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, watch } from 'vue';
import dayjs from 'dayjs';
import LockIcon from '../assets/lock.svg';
import ArgonIcon from '../assets/logo-straight.svg';
import utc from 'dayjs/plugin/utc';
import Chart from '../components/Chart.vue';
import ChartBg from '../components/ChartBg.vue';
import NibSlider from '../components/NibSlider.vue';
import ChartMarker from '../overlays/ChartMarker.vue';
import { useBasicStore } from '../store';
import { type Side } from '../lib/ScenarioConfig';
import { useDesktopLayout } from '../lib/ResponsiveLayout';
import { useEvent } from '../lib/EventUtils';
import { hideInsight } from '../lib/InsightUtils';
import DesktopLayout from '../layouts/DesktopLayout.vue';
import MobileLayout from '../layouts/MobileLayout.vue';
dayjs.extend(utc);
const store = useBasicStore();
const desktop = useDesktopLayout();
const sides: Side[] = ['left', 'right'];
const chartRef = ref<InstanceType<typeof Chart> | null>(null);
const chartArea = ref<HTMLElement | null>(null);
const selected = ref<Side>('left');
const nibsActive = ref({ left: false, right: false });
const isDragging = ref(false);
const geometryReady = ref(false);
const positions = ref({ left: { x: 0, top: 0 }, right: { x: 0, top: 0 } });
const markers = ref({ left: { left: 0, top: 0, opacity: 0, item: {} }, right: { left: 0, top: 0, opacity: 0, item: {} } });
type Bounds = { left: number; right: number; top: number; bottom: number; viewportHeight: number };
const bounds = ref<{ left: Bounds | null; right: Bounds | null }>({ left: null, right: null });
const tooltipOffsets = computed(() => {
  const { left, right } = bounds.value;
  if (!left || !right || left.right + 8 <= right.left || right.right + 8 <= left.left || left.bottom + 8 <= right.top || right.bottom + 8 <= left.top) return { left: 0, right: 0 };
  const gap = left.bottom + 8 - right.top;
  const up = Math.min(gap / 2, Math.max(0, left.top - 8));
  return { left: -up, right: gap - up };
});
const highlightDate = ref<string | null>(null);
const highlightKind = ref<'start' | 'end' | 'ratchet' | 'short' | null>(null);
const highlightPosition = ref<{ x: number; y: number } | null>(null);
let drag: { side: Side; pointerId: number; offset: number; startIndex: number; left: number; right: number; both: boolean } | null = null;
let geometryFrame: number | null = null;
function syncGeometry() {
  if (geometryFrame !== null) cancelAnimationFrame(geometryFrame);
  geometryFrame = requestAnimationFrame(() => {
    geometryFrame = null;
    const chart = chartRef.value;
    if (!chart) return;
    for (const side of sides) {
      const index = store.sliderIndexes[side];
      const point = chart.getPointPosition(index);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
      positions.value[side] = { x: point.x, top: Math.max(20, point.y - 50) };
      markers.value[side] = { left: point.x, top: point.y, opacity: 1, item: chart.getItem(index) };
    }
    highlightPosition.value = highlightDate.value ? chart.getPointPosition(store.dateDomain.indexByDate.get(highlightDate.value) || 0) : null;
    geometryReady.value = true;
  });
}
function selectEndpoint(side: Side) {
  selected.value = side;
  nibsActive.value = { left: side === 'left', right: side === 'right' };
}
function deselectBarsOnOutsidePress(event: PointerEvent) {
  if (isDragging.value) return;
  if (event.target instanceof Element && event.target.closest('[SelectedLine]')) return;
  nibsActive.value = { left: false, right: false };
}
function startDrag(side: Side, event: PointerEvent) {
  if (drag) return;
  if (Math.abs(positions.value.left.x - positions.value.right.x) < 44) side = selected.value;
  const both = desktop.value && (event.shiftKey || event.metaKey);
  if (!both) selectEndpoint(side);
  else { nibsActive.value = { left: true, right: true }; selected.value = side; }
  const chart = chartRef.value;
  if (!chart) return;
  drag = { side, pointerId: event.pointerId, offset: chart.getClientX(store.sliderIndexes[side]) - event.clientX,
    startIndex: store.sliderIndexes[side], left: store.sliderIndexes.left, right: store.sliderIndexes.right, both };
  isDragging.value = true;
  hideInsight(true);
  document.body.classList.add('isGrabbing');
}
function moveEndpoint(side: Side, index: number) {
  const date = store.dateDomain.clamp(side, index, store.sliderDates);
  store.commitScenario({ sliderDates: { ...store.sliderDates, [side]: date } });
}
function moveBoth(left: number, right: number, delta: number) {
  delta = Math.max(-left, Math.min(delta, store.dateDomain.dates.length - 1 - right));
  const range = { left: store.dateDomain.dates[left + delta], right: store.dateDomain.dates[right + delta] };
  try { store.commitScenario({ sliderDates: range }); } catch { /* A six-calendar-month range can vary in day length. */ }
}
function onDrag(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId) return;
  const index = chartRef.value?.getIndexAtClientX(event.clientX + drag.offset);
  if (index === undefined || !Number.isFinite(index)) return;
  if (drag.both) moveBoth(drag.left, drag.right, index - drag.startIndex);
  else moveEndpoint(drag.side, index);
}
function finishDrag(event: PointerEvent) { if (drag?.pointerId === event.pointerId) { onDrag(event); cancelDrag(); } }
function cancelDrag() { drag = null; isDragging.value = false; document.body.classList.remove('isGrabbing'); }
function handleEndpointKey(event: KeyboardEvent, side: Side) { selectEndpoint(side); handleChartKey(event); }
function handleChartKey(event: KeyboardEvent) {
  if ((event.target as Element)?.closest('input,textarea,select,[contenteditable=true],[role=dialog]')) return;
  if (event.key === 'Escape') { cancelDrag(); nibsActive.value = { left: false, right: false }; return; }
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === 'ArrowLeft' ? -1 : 1;
  const old = store.sliderIndexes[selected.value];
  let index = old + direction;
  if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = store.dateDomain.dates.length - 1;
  else if (event.shiftKey) {
    const date = dayjs.utc(store.sliderDates[selected.value]).add(direction, 'month').startOf('month').format('YYYY-MM-DD');
    index = store.dateDomain.indexByDate.get(date) ?? (direction < 0 ? 0 : store.dateDomain.dates.length - 1);
  }
  if (nibsActive.value.left && nibsActive.value.right) moveBoth(store.sliderIndexes.left, store.sliderIndexes.right, index - old);
  else moveEndpoint(selected.value, index);
}
useEvent<{ isStart?: boolean; isEnd?: boolean; isShort?: boolean; date?: string }>('highlight', data => {
  highlightKind.value = data.isStart ? 'start' : data.isEnd ? 'end' : data.isShort ? 'short' : 'ratchet';
  highlightDate.value = data.isStart ? store.sliderDates.left : data.isEnd ? store.sliderDates.right : data.date || null;
  syncGeometry();
});
useEvent('unhighlight', () => { highlightDate.value = null; highlightPosition.value = null; highlightKind.value = null; });
onScopeDispose(store.registerPositionCheck('nibSliders', () => chartArea.value?.getBoundingClientRect() || new DOMRect()));
watch(() => [store.sliderDates.left, store.sliderDates.right], syncGeometry);
watch(desktop, () => { cancelDrag(); syncGeometry(); });
onMounted(async () => {
  document.addEventListener('pointerdown', deselectBarsOnOutsidePress, true);
  await nextTick();
  const items = store.bitcoinPrices.all.map(row => ({ ...row, showPointOnChart: false, fee: store.bitcoinFees.getByDate(row.date) }));
  chartRef.value?.reloadData(items.map((item, index) => ({ ...item, previous: items[index - 1] })));
  syncGeometry();
  window.addEventListener('resize', cancelDrag);
});
onScopeDispose(() => {
  document.removeEventListener('pointerdown', deselectBarsOnOutsidePress, true);
  cancelDrag();
  if (geometryFrame !== null) cancelAnimationFrame(geometryFrame);
  window.removeEventListener('resize', cancelDrag);
});
</script>
<style scoped>
.simulator { position: relative; min-width: 0; padding: 1rem; }
.chart-region { position: relative; height: clamp(240px, 42svh, 360px); min-width: 0; margin: 0 -1rem .9rem; }
.activity-marker :deep(svg path) { fill: #64748b; }
.activity-line { box-shadow: 1px 1px 0 #ffffff80; background: linear-gradient(to bottom, #47556980, #47556900); }
@media (max-height: 450px) { .chart-region { height: 210px; } }
@screen desktop {
  .simulator { height: calc(100dvh - 57px); min-height: 600px; padding: 0; color: black; }
  .chart-region { position: absolute; inset: 0; height: 100%; margin: 0; }
}
</style>
