<template>
  <div ref="componentElement" class="Main Component relative pt-2 -mt-2 h-full flex flex-col select-none">
    <div class="h-full flex flex-col relative">
      
      <div class="absolute left-20 top-[20%] flex flex-col z-[1100] min-w-[30%] xl:min-w-[35%] pb-20">
        
        <section class="divide-y divide-slate-400/40 border-b border-slate-400/40 whitespace-nowrap">
          <h3 class="py-1 font-semibold">CONFIGURE YOUR BITCOIN</h3>
          <div class="py-1 pr-3">
            Bitcoin goes into the vault on
            <DatePicker @update:modelValue="updateLeftSliderDate" v-model="sliderDates.left" timezone="UTC" is-required>
              <template #default="{ togglePopover }">
                <button
                  class="text-sm font-mono border border-dashed px-1 border-slate-400/80 rounded bg-white/20 hover:bg-white/50"
                  @click="togglePopover"
                >
                  {{ dayjs.utc(sliderDates.left).format('MMMM D, YYYY') }}
                </button>
              </template>
            </DatePicker>
          </div>
          <div class="py-1 pr-3">
            Bitcoin is pulled from the Vault on
            <DatePicker @update:modelValue="updateRightSliderDate" v-model="sliderDates.right" timezone="UTC" is-required>
              <template #default="{ togglePopover }">
                <button
                  class="text-sm font-mono border border-dashed px-1 border-slate-400/80 rounded bg-white/20 hover:bg-white/50"
                  @click="togglePopover"
                >
                  {{ dayjs.utc(sliderDates.right).format('MMMM D, YYYY') }}
                </button>
              </template>
            </DatePicker>
          </div>
          <div class="py-1 pr-3">
            It ratchets when Bitcoin's price changes by 
            <input type="text" @keydown="handleRatchetPctKeyPress" class="w-10 px-2 leading-none text-sm py-0 bg-white/20 hover:bg-white/50 rounded border-slate-400/60 border-dashed focus:border-solid font-mono" v-model="ratchetPct" />% or more
          </div>
        </section>

        <section class="mt-4">
          <h3 class="py-1 font-semibold border-b border-slate-400/40">
            CONFIGURE ARGON PRICE DROPS 
            <span class="text-slate-400/60">(</span><span @click="addShort" class="text-fuchsia-700 hover:text-fuchsia-500 cursor-pointer">ADD</span><span class="text-slate-400/60">)</span>
          </h3>
          <div v-if="!shorts.length" class="border-b border-slate-400/40 py-1 italic text-slate-500/80">
            No price drops configured
          </div>
          <div v-else v-for="short of shorts" :key="short.date">
            <div PriceDrop v-if="short.date === 'EXIT'" class="border-b border-slate-400/40 py-1">
              Argon collapses to ${{ short.lowestPrice }} right before you pull your bitcoin
              <div @click="confirmShortRemoval(short)" class="absolute right-0 top-1 w-6 h-6 border border-slate-400/80 rounded text-fuchsia-700 hover:bg-white/50 cursor-pointer flex items-center justify-center">
                <TrashIcon class="w-4 h-4" />
              </div>
            </div>
            <div PriceDrop v-else-if="short.date.isAfter(sliderDates.left) && short.date.isBefore(sliderDates.right)" class="border-b border-slate-400/40 py-1">
              On {{ dayjs(short.date).format('MMMM D, YYYY') }} Argon drops from $1.00 to ${{ short.lowestPrice }}
              <div @click="confirmShortRemoval(short)" class="absolute right-0 top-1 w-6 h-6 border border-slate-400/80 rounded text-fuchsia-700 hover:bg-white/50 cursor-pointer flex items-center justify-center">
                <TrashIcon class="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        <div class="absolute bottom-0 flex flex-row space-x-4 whitespace-nowrap">
          <Popover v-slot="{ open: isOpen }" class="relative">
            <PopoverButton class="inline-flex items-center gap-x-1 border border-slate-400 text-fuchsia-700 py-2 px-6 rounded-md bg-white/50 hover:bg-white/100 focus:outline-none">
              <span class="pointer-events-none">{{ isOpen ? 'Close' : 'Open' }} Ratchets List</span>
              <!-- <ChevronDownIcon class="h-5 w-5 pointer-events-none" aria-hidden="true" /> -->
            </PopoverButton>
            <ActionsList :actions="actions" :spaceAboveButton="calculateSpaceAboveButton(isOpen)" />
          </Popover>

          <button @click="downloadRawData" class="border border-slate-400 text-fuchsia-700 py-2 px-6 rounded-md bg-white/50 hover:bg-white/100">
            Download Raw Data
          </button>
        </div>
      </div>

      <div class="grow relative">
        <NibSlider @mousedown="startDrag('left', $event)" @touchstart="startDrag('left', $event)" position="left" :pos="sliderLeft" :isActive="nibsActive.left" />
        <NibSlider @mousedown="startDrag('right', $event)" @touchstart="startDrag('right', $event)" position="right" :pos="sliderRight" :isActive="nibsActive.right" />
        
        <ChartMarker direction="left" :config="chartMarkerLeft" class="z-[1000]" />
        <ChartMarker direction="right" :config="chartMarkerRight" class="z-[1000]" />

        <ChartBg />
        <Chart ref="chartRef" :disableTooltip="isDragging">
          <!-- <template v-for="ratchet of ratchets" :key="ratchet.date">
            <div v-if="ratchet.profitIncreasePct" :style="`left: ${ratchet.left}px; top: ${ratchet.profitTop}px; height: ${ratchet.profitHeight}px`" class="absolute -mt-3 font-bold text-slate-400">
              <span class="text-green-600/70 relative z-30 text-sm">{{ formatShorthandNumber(ratchet.profitIncreasePct) }}%</span>
              <div VerticalLine class="absolute left-1/2 top-5 bottom-0 bg-slate-400/30 w-[1px]"></div>
            </div>
            <div v-else-if="ratchet.isDownRatchet" :style="`left: ${ratchet.left}px; top: ${ratchet.iconTop}px; height: ${ratchet.iconHeight}px`" class="absolute -mt-3 font-bold text-slate-400">
              <LockIcon Icon class="w-3 h-3 relative z-30" />
              <div VerticalLine class="absolute left-1/2 top-5 bottom-0 bg-slate-400/30 w-[1px]"></div>
            </div>
          </template> -->
        </Chart>
      </div>
    
    </div>
    <ConfirmShortRemoval />
    <AddShort />
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useBasicStore } from '../store';
import Chart from '../components/Chart.vue';
import ChartBg from '../components/ChartBg.vue';
import { storeToRefs } from 'pinia';
import Vault, { IAction, IShort } from '../lib/Vault';
import emitter from '../emitters/basic';
import NibSlider from '../components/NibSlider.vue';
import ChartMarker from '../overlays/ChartMarker.vue';
import { Popover, PopoverButton } from '@headlessui/vue'
import { TrashIcon } from '@heroicons/vue/24/outline';
import ActionsList from '../overlays/ActionsList.vue';
import ConfirmShortRemoval from '../overlays/ConfirmShortRemoval.vue';
import AddShort from '../overlays/AddShort.vue';
import { DatePicker } from '@angelblanco/v-calendar';
import Download from '../lib/Download';

import '@angelblanco/v-calendar/style.css';

dayjs.extend(utc);

const basicStore = useBasicStore();
const { btcPrices, btcFees } = basicStore;
const { sliderIndexes, sliderDates, ratchetPct } = storeToRefs(basicStore);

const chartRef = Vue.ref<typeof Chart | null>(null);
const chartMarkerLeft = Vue.ref({ left: 0, top: 0, opacity: 0, item: {} as any });
const chartMarkerRight = Vue.ref({ left: 0, top: 0, opacity: 0, item: {} as any });

const isDragging = Vue.ref(false);
const componentElement = Vue.ref(null);

let dragMeta: any = {};

const nibsActive = Vue.ref({ left: false, right: false });

const sliderLeft = Vue.ref(0);
const sliderRight = Vue.ref(0);

const actions = Vue.ref<IAction[]>([]);
let vault = Vue.ref<Vault | null>(null);

const shorts = Vue.ref([
  { date: dayjs.utc('2022-01-06'), lowestPrice: 0.001 },
  { date: dayjs.utc('2022-03-09'), lowestPrice: 0.46 },
  { date: 'EXIT', lowestPrice: 0.001 },
]);

function downloadRawData() {
  new Download().run();
}

function addShort() {
  const handlerFn = function(x: IShort) {
    shorts.value.push(x);
    emitter.off('addShort', handlerFn);
    sortShorts();
    runVault();
  }
  emitter.on('addShort', handlerFn);

  emitter.emit('openAddShort', { 
    sliderDates: [sliderDates.value.left, sliderDates.value.right],
    shorts: shorts.value,
  });
}

function sortShorts() {
  shorts.value.sort((a: IShort, b: IShort) => {
    if (a.date === 'EXIT') return 1;
    if (b.date === 'EXIT') return -1;
    return dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1;
  });
}

function confirmShortRemoval(short: any) {
  const handlerFn = function(x: any) {
    shorts.value = shorts.value.filter((s: any) => s.date !== x.date);
    emitter.off('removeShortConfirmed', handlerFn);
    runVault();
  }
  emitter.on('removeShortConfirmed', handlerFn);
  emitter.emit('openConfirmShortRemoval', short);
}

function calculateSpaceAboveButton(isOpen: boolean) {
  if (!isOpen) return 0;

  const targetElem = event.target as HTMLElement;
  const rect = targetElem.getBoundingClientRect();
  const spaceAboveButton = rect.top;

  return spaceAboveButton;
}

function updateLeftSliderDate(date: Date) {
  const index = chartRef.value?.getItemIndexFromDate(dayjs.utc(date).format('YYYY-MM-DD'));
  if (sliderIndexes.value.left === index) return;

  updateLeftSlider(index);
  runVault();
}

function updateRightSliderDate(date: Date) {
  const index = chartRef.value?.getItemIndexFromDate(dayjs.utc(date).format('YYYY-MM-DD'));
  if (sliderIndexes.value.right === index) return;

  updateRightSlider(index);
  runVault();
}

function handleRatchetPctKeyPress(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    ratchetPct.value += 1;
  } else if (event.key === 'ArrowDown') {
    ratchetPct.value -= 1;
  }
}

function startDrag(side: 'left' | 'right', event: MouseEvent | TouchEvent) { 
  const elementLeftPos = side === 'left' ? sliderLeft.value : sliderRight.value;
  const otherSide = side === 'left' ? 'right' : 'left';

  isDragging.value = true;
  dragMeta = {
    side,
    startX: event.clientX,
    elemOffset: elementLeftPos - event.clientX,
    elemLeftPos: elementLeftPos,
    startNibActive: nibsActive.value[side],
    startIndex: sliderIndexes.value[side],
    startIndexOther: sliderIndexes.value[otherSide],
    hasShiftKey: event.metaKey || event.shiftKey,
  };

  updateNibActiveBeforeDrag();
  dragMeta.isDraggingBoth = nibsActive.value.left && nibsActive.value.right;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;

  const currentX = event.touches ? event.touches[0].clientX : event.clientX;
  const currentIndex = chartRef.value?.getItemIndexFromEvent(event, { x: currentX });
  
  dragMeta.wasDragged = dragMeta.wasDragged || (currentIndex !== dragMeta.startIndex);

  if (dragMeta.isDraggingBoth) {
    const indexDiff = currentIndex - dragMeta.startIndex;
    if (dragMeta.side === 'left') {
      updateLeftSlider(dragMeta.startIndex + indexDiff);
      updateRightSlider(dragMeta.startIndexOther + indexDiff);
    } else {
      updateLeftSlider(dragMeta.startIndexOther + indexDiff);
      updateRightSlider(dragMeta.startIndex + indexDiff);
    }
  } else if (dragMeta.side === 'left') {
    updateLeftSlider(currentIndex);
  } else {
    updateRightSlider(currentIndex);
  }
  runVault();
}

function stopDrag(event: MouseEvent | TouchEvent) {
  isDragging.value = false;

  const currentX = event.touches ? event.touches[0].clientX : event.clientX;
  const currentIndex = chartRef.value?.getItemIndexFromEvent(event, { x: currentX });
  
  if (dragMeta.isDraggingBoth) {
    const indexDiff = currentIndex - dragMeta.startIndex;
    if (dragMeta.side === 'left') {
      updateLeftSlider(dragMeta.startIndex + indexDiff);
      updateRightSlider(dragMeta.startIndexOther + indexDiff);
    } else {
      updateLeftSlider(dragMeta.startIndexOther + indexDiff);
      updateRightSlider(dragMeta.startIndex + indexDiff);
    }
  } else if (dragMeta.side === 'left') {
    updateLeftSlider(currentIndex);
  } else {
    updateRightSlider(currentIndex);
  }
  runVault();

  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchend', stopDrag);

  updateNibActiveAfterDrag();
}

function updateNibActiveBeforeDrag() { 
  nibsActive.value[dragMeta.side] = true;
}

function updateNibActiveAfterDrag() { 
  const otherSide = dragMeta.side === 'left' ? 'right' : 'left';
  const otherSideSelected = nibsActive.value[otherSide];

  if (dragMeta.wasDragged) {
    nibsActive.value[dragMeta.side] = dragMeta.hasShiftKey || dragMeta.startNibActive;
    return;
  }

  if (dragMeta.hasShiftKey) {
    nibsActive.value[dragMeta.side] = !dragMeta.startNibActive;
  } else {
    nibsActive.value[dragMeta.side] = otherSideSelected ? true : !dragMeta.startNibActive;
    nibsActive.value[otherSide] = false;
  }
}

function updateLeftSlider(index: number) {
  if (index > sliderIndexes.value.right - 1) return;

  sliderIndexes.value.left = index;
  const startingItem = chartRef.value?.getItem(index);

  const pointPosition = chartRef.value?.getPointPosition(index);
  sliderLeft.value = pointPosition.x;
  sliderDates.value.left = startingItem.date;
  
  chartMarkerLeft.value.left = pointPosition.x;
  chartMarkerLeft.value.top = pointPosition.y;
  chartMarkerLeft.value.opacity = 1;
  chartMarkerLeft.value.item = startingItem;
}

function updateRightSlider(index: number) {
  if (index < sliderIndexes.value.left + 1) return;

  sliderIndexes.value.right = index;
  const endingItem = chartRef.value?.getItem(index);

  const pointPosition = chartRef.value?.getPointPosition(index);
  sliderRight.value = pointPosition.x;
  sliderDates.value.right = endingItem.date;

  chartMarkerRight.value.left = pointPosition.x;
  chartMarkerRight.value.top = pointPosition.y;
  chartMarkerRight.value.opacity = 1;
  chartMarkerRight.value.item = endingItem;
}

function runVault() {
  const leftIndex = sliderIndexes.value.left;
  const rightIndex = sliderIndexes.value.right;
  
  const startingItem = chartRef.value?.getItem(leftIndex);
  const endingItem = chartRef.value?.getItem(rightIndex);
  
  vault = new Vault(startingItem.date, endingItem.date, ratchetPct.value, shorts.value, btcPrices, btcFees);

  basicStore.updateVaultStats({
    ratchetCount: vault.actions.length,
    shortCount: vault.shorts.length,
    liquidCash: vault.aggregatedLiquidCash,
    vaulterProfit: vault.vaulterProfit,
    hodlerProfit: vault.hodlerProfit,
  });

  actions.value = vault.actions;
}

function loadChartData() {
  const priceRecords = btcPrices.all;
  const allItems: any[] = [];

  for (const [index, priceRecord] of priceRecords.entries()) {
    const item = {
      ...priceRecord,
      showPointOnChart: index === 0,
      previous: priceRecords[index - 1],
      next: priceRecords[index + 1],
    };    
    allItems.push(item);
  }

  chartRef.value?.reloadData(allItems);
  updateLeftSlider(sliderIndexes.value.left);
  updateRightSlider(sliderIndexes.value.right);
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    nibsActive.value = { left: false, right: false };
    return;
  }

  const isShiftPressed = event.shiftKey;
  const isLeftKey = event.key === 'ArrowLeft';
  const isRightKey = event.key === 'ArrowRight';
  if (!isLeftKey && !isRightKey) return;

  const minIndex = 0;
  const maxIndex = chartRef.value?.getItemCount() - 1;

  let wasUpdated = false;
  let stepsToJump = isLeftKey ? -1 : 1;

  if (isShiftPressed) {
    if (nibsActive.value.left && nibsActive.value.right) {
      if (isLeftKey) {
        let newIndex = chartRef.value?.getPrevMonthIndex(sliderIndexes.value.left)
        newIndex = Math.max(newIndex, minIndex);
        stepsToJump = newIndex - sliderIndexes.value.left;
      } else if (isRightKey) {
        const spaceBetween = sliderIndexes.value.right - sliderIndexes.value.left;
        let newIndex = chartRef.value?.getNextMonthIndex(sliderIndexes.value.left);
        newIndex = Math.min(stepsToJump - spaceBetween, maxIndex - spaceBetween) + spaceBetween;
        stepsToJump = newIndex - sliderIndexes.value.left;
      }
    } else {
      const nibName = nibsActive.value.left ? 'left' : 'right';
      if (isLeftKey) {
        let newIndex = chartRef.value?.getPrevMonthIndex(sliderIndexes.value[nibName]);
        if (nibsActive.value.left) {
          newIndex = Math.max(newIndex, minIndex);
        } else {
          newIndex = Math.max(newIndex, sliderIndexes.value.left + 1);
        }
        stepsToJump = newIndex - sliderIndexes.value[nibName];
      } else if (isRightKey) {
        let newIndex = chartRef.value?.getNextMonthIndex(sliderIndexes.value[nibName]);
        if (nibsActive.value.right) {
          newIndex = Math.min(newIndex, maxIndex);
        } else {
          newIndex = Math.min(newIndex, sliderIndexes.value.right - 1);
        }
        stepsToJump = newIndex - sliderIndexes.value[nibName];
      }
    }
  }

  if (nibsActive.value.left) {
    updateLeftSlider(sliderIndexes.value.left + stepsToJump);    
    wasUpdated = true;
  }
  
  if (nibsActive.value.right) {
    updateRightSlider(sliderIndexes.value.right + stepsToJump);
    wasUpdated = true;
  }
  
  if (wasUpdated) {
    runVault();
  }
}

Vue.watch(ratchetPct, (newVal: number) => {
  ratchetPct.value = Math.max(newVal, 1);
  ratchetPct.value = Math.min(ratchetPct.value, 100);
  runVault();
});

Vue.onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  loadChartData();
  runVault();
});

Vue.onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>

<style lang="scss">
.Main.Component {
  [VerticalLine] {
    box-shadow: 1px 1px 0 0 rgba(255, 255, 255, 1);
  }

  svg[Icon] path {
    fill: rgb(100, 116, 139) !important;
  }

  .CalloutText {
    @apply font-light text-slate-400 select-none;
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
    &:hover {
      @apply text-slate-500;
    }
  }

  [PriceDrop] {
    position: relative;
    &:hover:after {
      background: linear-gradient(to right, rgba(203, 213, 225, 0) 0%, rgba(203, 213, 225, 0.5) 10%, rgba(203, 213, 225, 0.5) 90%, rgba(203, 213, 225, 0) 100%);
      content: '';
      position: absolute;
      z-index: -1;      left: 0;
      right: 0;
      top: 1px;
      bottom: 2px;
    }
  }
}
</style>