<template>
  <div Wrapper class="grow h-full flex flex-col relative">
    <div class="absolute w-full h-full">
      <slot />
    </div>

    <div ChartWrapper class="flex-1 min-h-0 relative w-full">
      <canvas id="MyChart" ref="chartRef" class="absolute inset-0 max-w-full max-h-full"></canvas>
    </div>

    <div v-if="markerPos.show" StartMarker class="MARKER cursor-pointer" :style="`left: ${markerPos.left}px; top: ${markerPos.top}px`"></div>
    <XAxis :ticks="axisTicks" :years="axisYears" class="relative mb-4 shrink-0" />
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { DESKTOP_QUERY } from '../lib/ResponsiveLayout';
import dayjs, { Dayjs } from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, TimeScale, Tooltip, TooltipModel } from 'chart.js';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import { createChartOptions, getYearIntervals } from '../lib/ChartOptions';
import XAxis from './XAxis.vue';

dayjs.extend(dayjsUtc);
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, TimeScale, Tooltip);

const props = defineProps<{ 
  dateRange: { first: string; last: string },
  isRunning?: boolean,
  disableTooltip?: boolean,
}>();
const emit = defineEmits<{ geometry: [] }>();
const axisTicks = Vue.ref<{ label: string; x: number }[]>([]);
const axisYears = Vue.ref<{ label: string; x: number; width: number }[]>([]);

const markerPos = Vue.ref({ show: false, left: 0, top: 0 });

const chartRef = Vue.ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const chartPoints: any[] = [];
const pointRadius: number[] = [];
const pointItems: any[] = [];
const pointItemsByDate: Record<string, any> = {};

const tooltipConfig = Vue.ref({
  opacity: 0,
  class: '',
  left: 0,
  top: 0,
  item: {} as any,
});

function toggleDatasetVisibility(index: number, visible: boolean) {
  const dataset = chart?.data.datasets[index];
  if (dataset) {
    dataset.hidden = !visible;
  }
  chart?.update();
}

function clearPoints() {
  chartPoints.splice(0, chartPoints.length);
  pointRadius.splice(0, pointRadius.length);
  pointItems.splice(0, pointItems.length);
  chart?.update();
}

function setDateRange(min: string, max: string) {
  if (!chart) return;
  (chart as any).options.scales.x.min = dayjs.utc(min).valueOf();
  (chart as any).options.scales.x.max = dayjs.utc(max).valueOf();
  chart.update();
}
Vue.watch(() => [props.dateRange.first, props.dateRange.last], ([first, last]) => setDateRange(first, last));

function addPoints(items: { date: string, price: number, showPointOnChart: boolean }[]) {
  const lastIndex = chartPoints.length - 1;
  if (lastIndex > 0) {
    pointRadius[lastIndex] = chartPoints[lastIndex].showPointOnChart ? 4 : 0;
  }
  
  for (const item of items) {
    const date = dayjs.utc(item.date);
    const price = item.price;

    chartPoints.push({ x: date.valueOf(), y: price });
    pointRadius.push(item.showPointOnChart ? 4 : 0);
    pointItems.push(item);
    pointItemsByDate[item.date] = item;
  }
  
  pointRadius[pointRadius.length - 1] = 4;

  pointRadius[0] = 4;

  if (!chart) return;
  chart.update();

  const dataset = chart.data.datasets[0];
  const datasetData = dataset.data;
  const currentIndex = datasetData.length - 1;

  const meta = chart?.getDatasetMeta(0);
  const currentDataPoint = meta?.data[currentIndex];

  markerPos.value.left = currentDataPoint?.x || 0;
  markerPos.value.top = currentDataPoint?.y || 0;

  // Trigger tooltip on the latest point
  if (props.isRunning && currentDataPoint && pointItems.length > 10) {
    chart?.tooltip?.setActiveElements([{ datasetIndex: 0, index: currentIndex }], { x: currentDataPoint.x, y: currentDataPoint.y });
    chart?.update();
  }

  return { x: currentDataPoint?.x ?? NaN, y: currentDataPoint?.y ?? NaN };
}

const tooltipOpened = Vue.ref(false);

function reloadData(items: any[]) {
  if (!chart) return;

  chartPoints.splice(0, chartPoints.length);
  pointRadius.splice(0, pointRadius.length);
  pointItems.splice(0, pointItems.length);

  addPoints(items);
  chart.update();
}

function getPointPosition(index: number) {
  const meta = chart?.getDatasetMeta(0);
  const currentDataPoint = meta?.data[index];

  return { x: currentDataPoint?.x ?? NaN, y: currentDataPoint?.y ?? NaN };
}

function getItem(index: number) {
  index = Math.max(0, index);
  index = Math.min(pointItems.length - 1, index);
  return pointItems[index];
}

function getItems(startIndex: number, endIndex: number) {
  return pointItems.slice(startIndex, endIndex);
}

function getItemCount() {
  return pointItems.length;
}

function getItemIndexFromDate(date: string | Dayjs) {
  if (dayjs.isDayjs(date)) {
    date = date.format('YYYY-MM-DD');
  }
  return pointItemsByDate[date] ? pointItems.indexOf(pointItemsByDate[date]) : -1;
}

function getItemIndexFromEvent(event: MouseEvent, override: { x?: number, y?: number } = {}) {
  return getIndexAtClientX(override.x ?? event.clientX);
}

function getClientX(index: number) {
  if (!chart || !chartRef.value) return 0;
  const rect = chartRef.value.getBoundingClientRect();
  return rect.left + getPointPosition(index).x * rect.width / chart.width;
}

function getIndexAtClientX(clientX: number) {
  if (!chart || !chartRef.value || !pointItems.length) return undefined;
  const rect = chartRef.value.getBoundingClientRect();
  const x = (clientX - rect.left) * chart.width / rect.width;
  const scale = chart.scales.x;
  const timestamp = Number(scale.getValueForPixel(Math.max(scale.left, Math.min(x, scale.right))));
  // Binary search the actual data; do not depend on viewport offsets or missing dates.
  let lo = 0, hi = chartPoints.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (chartPoints[mid].x.valueOf() < timestamp) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && timestamp - chartPoints[lo - 1].x.valueOf() < chartPoints[lo].x.valueOf() - timestamp) lo--;
  return lo;
}

function getPrevMonthIndex(index: number) {
  const currentDate = dayjs.utc(pointItems[index].date);
  const dayOfMonth = currentDate.date();
  const previousDate = dayOfMonth === 1 ? currentDate.subtract(1, 'month') : currentDate.startOf('month');
  const daysToSubtract = currentDate.diff(previousDate, 'day');
  return index - daysToSubtract;
}

function getNextMonthIndex(index: number) {
  const currentDate = dayjs.utc(pointItems[index].date);
  const nextDate = currentDate.add(1, 'month').startOf('month');
  const daysToAdd = nextDate.diff(currentDate, 'day');
  return index + daysToAdd;
}

function onTooltipFn(tooltip: TooltipModel<any>, closeIfItemMatchesThis?: any) {
  if (tooltipOpened.value) return;
  // Hide if no tooltip
  if (tooltip.opacity === 0 || !tooltip.dataPoints || props.disableTooltip) {
    tooltipConfig.value.opacity = 0;
    return;
  }

  const pointIndex = tooltip.dataPoints[0].dataIndex;
  const item = pointItems[pointIndex];

  if (closeIfItemMatchesThis === item) {
    tooltipConfig.value.opacity = 0;
    return;
  }

  tooltipConfig.value.item = item;

  // Set caret Position
  if (tooltip.yAlign) {
    tooltipConfig.value.class = tooltip.yAlign; // above or below
  } else {
    tooltipConfig.value.class = 'no-transform';
  }

  tooltipConfig.value.opacity = 1;
  tooltipConfig.value.left = tooltip.caretX;
  tooltipConfig.value.top = tooltip.caretY;
}

function startPulsing() {
  markerPos.value.show = true;
}

function stopPulsing() {
  markerPos.value.show = false;
}

Vue.onMounted(() => {
  if (chartRef.value) {
    const chartOptions = createChartOptions(chartPoints, pointRadius, onTooltipFn, props.dateRange);
    chart = new Chart(chartRef.value, { ...chartOptions,
      // Price inspection is controlled by the range bars.
      options: { ...chartOptions.options, events: [], plugins: { ...chartOptions.options.plugins, tooltip: false } },
      plugins: [{
      id: 'synchronizeGeometry',
      beforeLayout(updatedChart: Chart) {
        const desktop = window.matchMedia(DESKTOP_QUERY).matches;
        updatedChart.options.layout = {
          autoPadding: desktop,
          padding: { left: desktop ? 25 : 10, right: desktop ? 25 : 10, top: 0, bottom: 0 },
        };
      },
      afterUpdate(updatedChart: Chart) {
        dismissTooltip();
        const scale = updatedChart.scales.x;
        const years = getYearIntervals(scale.min, scale.max).map(year => {
          const x = scale.getPixelForValue(year.start);
          return { label: year.label, x, width: scale.getPixelForValue(year.end) - x };
        });
        axisYears.value = years;
        const step = Math.max(1, Math.ceil(years.length * 52 / Math.max(1, scale.width)));
        const candidates = years.map(year => ({ label: year.label, x: year.x + year.width / 2 }));
        const last = candidates[candidates.length - 1];
        // Always show the latest year; leave room for its label on narrow screens.
        axisTicks.value = last ? [...candidates.filter((tick, index) => index % step === 0 && tick.x <= last.x - 52), last] : [];
        emit('geometry');
      },
    }] } as any);
    window.addEventListener('scroll', dismissTooltip, true);
    window.addEventListener('keydown', dismissOnEscape);
    document.addEventListener('pointerdown', dismissOutside);
  }
});

function dismissTooltip() { tooltipConfig.value.opacity = 0; }
function dismissOutside(event: Event) { if (!chartRef.value?.contains(event.target as Node)) dismissTooltip(); }
function dismissOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') dismissTooltip(); }

Vue.onBeforeUnmount(() => {
  window.removeEventListener('scroll', dismissTooltip, true);
  window.removeEventListener('keydown', dismissOnEscape);
  document.removeEventListener('pointerdown', dismissOutside);
  if (chart) {
    chart.destroy();
  }
});

defineExpose({ 
  getIndexAtClientX, getClientX,
  getPrevMonthIndex,
  getNextMonthIndex,
  getItems,
  getItem,
  getItemIndexFromEvent, 
  getItemCount,
  getItemIndexFromDate,
  addPoints, reloadData, startPulsing, stopPulsing, clearPoints, toggleDatasetVisibility, setDateRange, getPointPosition });
</script>

<style lang="scss" scoped>
.MARKER {
  @apply rounded-full bg-[#63298E] absolute z-20 border border-slate-400;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

[ShadowSelection] {
  box-shadow: 1px 1px 1px 0 rgb(0 0 0), inset 1px 1px 1px 0 rgb(0 0 0);
}

.MARKER {
  pointer-events: none;

  &:before, &:after {
    content: "";
    display: block;
    position: absolute;
    border: 2px solid #63298E;
    left: -20px;
    right: -20px;
    top: -20px;
    bottom: -20px;
    border-radius: 50%;
    animation: animate 1.5s linear infinite;
    backface-visibility: hidden;
  }

  &:after {
    animation-delay: 0.5s;
  }
}

@keyframes animate {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
</style>
