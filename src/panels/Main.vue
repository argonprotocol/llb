<template>
  <div ref="componentElement" class="Main Component relative pt-2 -mt-2 h-full flex flex-col select-none">
    <div class="h-full flex flex-col relative">
      <div class="grow relative">
        <ChartBg />
        <Chart ref="chartRef" :disableTooltip="isDragging">          
          <div v-if="ratchetToHighlight.isActive" :style="`left: ${ratchetToHighlight.left}px; top: ${ratchetToHighlight.top}px; height: ${ratchetToHighlight.height}px`" class="absolute font-bold text-slate-400 -translate-x-1/2">
            <LockIcon Icon class="w-4 h-4 relative z-30" />
            <div VerticalLine class="absolute left-1/2 top-6 bottom-0 w-[1px]"></div>
          </div>

          <div v-if="shortToHighlight.isActive" :style="`left: ${shortToHighlight.left}px; top: ${shortToHighlight.top}px; height: ${shortToHighlight.height}px`" class="absolute font-bold text-slate-400 -translate-x-1/2">
            <ArgonIcon Icon class="w-6 h-6 relative z-30" />
            <div VerticalLine class="absolute left-1/2 top-7 bottom-0 w-[1px]"></div>
          </div>
        </Chart>
        <NibSlider ref="nibSliderLeftRef" @pointerdown="startDrag('left', $event)" @pointermove="onDrag('left', $event)" @pointerup="stopDrag('left', $event)" position="left" :pos="sliderLeftPosX" :isActive="nibsActive.left || highlightStart" />
        <NibSlider ref="nibSliderRightRef" @pointerdown="startDrag('right', $event)" @pointermove="onDrag('right', $event)" @pointerup="stopDrag('right', $event)" position="right" :pos="sliderRightPosX" :isActive="nibsActive.right || highlightEnd" />
        
        <ChartMarker direction="left" v-if="tourStep !== 1 || hasDraggedSlider" :config="chartMarkerLeft" />
        <ChartMarker direction="right" :config="chartMarkerRight" />
      </div>
    
      <div class="absolute left-20 top-[15%] flex flex-col min-w-[30%] xl:min-w-[35%] pb-20">
        <div class="relative max-w-[45%]">
          <p class="text-slate-700/80 text-base font-light text-shadow">
            <strong class="font-bold">What is Liquid Locking?</strong> Liquid Locking is the process of depositing bitcoins into Argon Stabilization Vaults. In doing so, new argons equal to the value of the bitcoins being vaulted are minted and liquidated into the market. This unlocks cash for the bitcoin holders. It also creates additional profit opportunities such as from bitcoin hedging and covering shorts from argon depegs.
          </p>

          <div ref="configSectionRef" class="absolute top-full translate-y-7 left-0">
            
            <section class="divide-y divide-slate-400/40 border-b border-slate-400/40 whitespace-nowrap uppercase text-sm">
              <h3 class="py-1 font-semibold text-base">CONFIGURE YOUR BITCOIN</h3>
              <div class="group relative py-2 pr-3">
                <EditorButton id="bitcoinCount" type="number" v-model="bitcoinCount" @showing="showingEditor" @hiding="hidingEditor" @updated="runVault" />
                {{ bitcoinCount === 1 ? 'bitcoin was' : 'bitcoins were' }} Bought on
                <EditorButton id="dateLeft" type="date" v-model="sliderDates.left" @updated="updateLeftSliderDate" @showing="showingEditor" @hiding="hidingEditor" />
                for ${{ purchasePrice > 100 ? addCommas(Math.round(purchasePrice)) : purchasePrice.toFixed(2) }}
                <div class="hidden group-hover:block absolute -right-14 top-1/2 -translate-y-1/2 translate-x-full text-slate-700/70 w-[300px] whitespace-normal normal-case">
                  <div InlineInsight class="absolute -left-8 border border-r-0 rounded-l-3xl border-slate-400/40 w-6 -top-5 -bottom-5 "></div>
                  Set the date when your bitcoin enters the Argon vaults. This determines when the downside risk of your bitcoin is hedged. The quantity or dollar amount of bitcoin does not change your percentage returns.
                </div>
              </div>
              <div class="group relative py-2 pr-3">
                The {{ bitcoinCount === 1 ? 'bitcoin is hodled' : 'bitcoins are hodled' }} until 
                <EditorButton id="dateRight" type="date" v-model="sliderDates.right" @updated="updateRightSliderDate" @showing="showingEditor" @hiding="hidingEditor" />
                <div class="hidden group-hover:block absolute -right-14 top-1/2 -translate-y-1/2 translate-x-full text-slate-700/70 w-[300px] whitespace-normal normal-case">
                  <div InlineInsight class="absolute -left-8 border border-r-0 rounded-l-3xl border-slate-400/40 w-6 -top-5 -bottom-5 "></div>
                  Set the date when you pull your bitcoin out of the Argon vaults. This is the date when the final profit calculations are determined.
                </div>
              </div>
              <div class="group relative py-2 pr-3">
                <template v-if="ratchetPct > 0" >
                  Ratcheting is triggered whenever Bitcoin's price changes 
                  <EditorButton id="ratchetPct" type="percent" v-model="ratchetPct" @showing="showingEditor" @hiding="hidingEditor" />
                  or more
                </template>
                <template v-else>
                  Ratcheting is
                  <EditorButton id="ratchetPct" type="percent" v-model="ratchetPct" @showing="showingEditor" @hiding="hidingEditor" label="disabled" />
                </template>
                <div class="hidden group-hover:block absolute -right-14 top-1/2 -translate-y-1/2 translate-x-full text-slate-700/70 w-[300px] whitespace-normal normal-case">
                  <div InlineInsight class="absolute -left-8 border border-r-0 rounded-l-3xl border-slate-400/40 w-6 -top-5 -bottom-5 "></div>
                  The lower your ratchet percentage, the tighter your hedge on downside risk, and therefore, the stronger your upside potential. Disable this feature by setting it to zero.
                </div>
              </div>
            </section>

            <section class="mt-4 uppercase text-sm">
              <h3 class="py-1 font-semibold border-b border-slate-400/40 text-base">
                CONFIGURE ARGON PRICE DROPS 
                <span class="text-slate-400/60">(</span>
                <span @click="addShort" insightId="addPriceDrop" position="right" @mouseenter="showInsight" @mouseleave="hideInsight" class="text-fuchsia-700 hover:text-fuchsia-500 cursor-pointer px-1">ADD</span>
                <span class="text-slate-400/60">)</span>
              </h3>
              <div v-if="!activeShorts.length" class="border-b border-slate-400/40 py-2 italic text-slate-500/80">
                No price drops configured
              </div>
              <div v-else v-for="short of activeShorts" :key="short.date">
                <div PriceDrop v-if="short.date === 'EXIT'" class="border-b border-slate-400/40 py-2" @mouseenter="highlightShort(short)" @mouseleave="unhighlightShort()">
                  Argon collapses to ${{ short.lowestPrice }} on the last day
                  <div @click="confirmShortRemoval(short)" class="absolute right-0 top-1.5 w-6 h-6 border border-slate-400/80 rounded text-fuchsia-700 hover:bg-white/50 cursor-pointer flex items-center justify-center">
                    <TrashIcon class="w-4 h-4" />
                  </div>
                </div>
                <div PriceDrop v-else class="border-b border-slate-400/40 py-2"  @mouseenter="highlightShort(short)" @mouseleave="unhighlightShort()">
                  On {{ dayjs(short.date).format('MMMM D, YYYY') }} Argon drops from $1.00 to ${{ short.lowestPrice }}
                  <div @click="confirmShortRemoval(short)" class="absolute right-0 top-1.5 w-6 h-6 border border-slate-400/80 rounded text-fuchsia-700 hover:bg-white/50 cursor-pointer flex items-center justify-center">
                    <TrashIcon class="w-4 h-4" />
                  </div>
                </div>
              </div>
            </section>

            <div class="absolute -bottom-5 flex flex-row space-x-4 whitespace-nowrap translate-y-full">
              <Popover v-slot="{ open: isOpen }" class="relative">
                <PopoverButton class="inline-flex items-center gap-x-1 border border-slate-400 text-fuchsia-700 py-1.5 px-6 rounded-md bg-white/50 hover:bg-white/100 focus:outline-none">
                  <span class="pointer-events-none">Show Vault Activity</span>
                </PopoverButton>
                <ActionsList :actions="actions" :buttonSpacing="calculateButtonSpacing(isOpen)" />
              </Popover>

              <button @click="downloadRawData" class="border border-slate-400 text-fuchsia-700 py-1.5 px-6 rounded-md bg-white/50 hover:bg-white/100">
                Download Raw Data
              </button>

              <span VideoLink @click="openVideo" class="text-fuchsia-600 hover:text-fuchsia-500 cursor-pointer flex flex-row items-center pl-1 font-bold">
                <PlayOutlined OutlineIcon class="w-6 h-6 inline-block" />
                <PlaySolid SolidIcon class="w-6 h-6 inline-block" />
                <span class="inline-block underline decoration-dashed decoration-fuchsia-300 underline-offset-4 ml-2">Watch <em class="italic">The Loser</em></span>
              </span>
            </div>
          </div>
        </div>
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
import Download from '../lib/Download';
import * as InsightUtils from '../lib/InsightUtils';
import { hideInsight } from '../lib/InsightUtils';
import EditorButton from '../components/EditorButton.vue';
import { addCommas } from '../lib/BasicUtils';
import LockIcon from '../assets/lock.svg';
import ArgonIcon from '../assets/logo-straight.svg';
import PlayOutlined from '../assets/play-outlined.svg';
import PlaySolid from '../assets/play-solid.svg';

import '@angelblanco/v-calendar/style.css';

dayjs.extend(utc);

const basicStore = useBasicStore();
const { btcPrices, btcFees } = basicStore;
const { sliderIndexes, sliderDates, ratchetPct, bitcoinCount, vaultSnapshot, tourStep, shorts } = storeToRefs(basicStore);

const chartRef = Vue.ref<typeof Chart | null>(null);
const chartMarkerLeft = Vue.ref({ left: 0, top: 0, opacity: 0, item: {} as any });
const chartMarkerRight = Vue.ref({ left: 0, top: 0, opacity: 0, item: {} as any });

const isDragging = Vue.ref(false);
const componentElement = Vue.ref(null);

let dragMeta: any = {};
let lastNibSliderPosition = { left: 0, top: 0, right: 0, bottom: 0 } as DOMRect;

const hasDraggedSlider = Vue.ref(false);

const nibsActive = Vue.ref({ left: false, right: false });

const purchasePrice = Vue.ref(0);

const actions = Vue.ref<IAction[]>([]);

const activeShorts = Vue.computed(() => shorts.value.filter((s: IShort) => {
  return s.date === 'EXIT' || (s.date.isAfter(sliderDates.value.left) && s.date.isBefore(sliderDates.value.right));
}));

const datePickerIsOpen = Vue.ref(false);

const configSectionRef = Vue.ref<HTMLElement | null>(null);
const nibSliderLeftRef = Vue.ref<HTMLElement | null>(null);
const nibSliderRightRef = Vue.ref<HTMLElement | null>(null);

const sliderLeftPosX = Vue.ref(0);
const sliderRightPosX = Vue.ref(0);

const shortToHighlight = Vue.ref({
  isActive: false,
  left: 0,
  top: 0,
  height: 0,
});

const highlightStart = Vue.ref(false);
const highlightEnd = Vue.ref(false);
const ratchetToHighlight = Vue.ref({
  isActive: false,
  left: 0,
  top: 0,
  height: 0,
});

basicStore.registerPositionCheck('configSection', () => {
  return configSectionRef.value?.getBoundingClientRect() || { left: 0, top: 0, right: 0, bottom: 0 } as DOMRect;
});

basicStore.registerPositionCheck('nibSliders', () => {
  if (hasDraggedSlider.value && lastNibSliderPosition.left) {
    return lastNibSliderPosition;
  }

  const nibSliderLeftElem = nibSliderLeftRef.value?.$el as HTMLElement;
  const nibSliderRightElem = nibSliderRightRef.value?.$el as HTMLElement;

  if (!nibSliderLeftElem || !nibSliderRightElem) return { left: 0, top: 0, right: 0, bottom: 0 } as DOMRect;

  const nibSliderLeftRect = nibSliderLeftElem.getBoundingClientRect();
  const nibSliderRightRect = nibSliderRightElem.getBoundingClientRect();
  const bottom = window.innerHeight;
  
  lastNibSliderPosition = {
    left: nibSliderLeftRect.left,
    top: Math.max(nibSliderLeftRect.top, nibSliderRightRect.top),
    right: nibSliderRightRect.right,
    bottom: bottom,
  } as DOMRect;

  return lastNibSliderPosition;
});

function openVideo() {
  emitter.emit('openVideoOverlay');
}

function showInsight(event: MouseEvent) {
  if (datePickerIsOpen.value) return;
  if (isDragging.value) return;

  InsightUtils.showInsight(event);
}

function showingEditor() {
  datePickerIsOpen.value = true;
  hideInsight();
}

function hidingEditor() {
  datePickerIsOpen.value = false;
}

async function downloadRawData() {
  await vaultSnapshot.value?.isLoaded;
  new Download(vaultSnapshot.value).run();
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
  basicStore.setConfig({ shorts: shorts.value });
}

function confirmShortRemoval(short: any) {
  const handlerFn = function(x: any) {
    shorts.value = shorts.value.filter((s: any) => s.date !== x.date);
    basicStore.setConfig({ shorts: shorts.value });
    emitter.off('removeShortConfirmed', handlerFn);
    runVault();
  }
  emitter.on('removeShortConfirmed', handlerFn);
  emitter.emit('openConfirmShortRemoval', short);
}

function calculateButtonSpacing(isOpen: boolean) {
  if (!isOpen) return { buttonHeight: 0, spaceAboveButton: 0 };

  const targetElem = event.target as HTMLElement;
  const rect = targetElem.getBoundingClientRect();
  const spaceAboveButton = rect.top;

  return {
    buttonHeight: rect.height,
    spaceAboveButton
  };
}

function updateLeftSliderDate(date: Date) {
  if (isDragging.value) return;

  const index = chartRef.value?.getItemIndexFromDate(dayjs.utc(date).format('YYYY-MM-DD'));
  if (sliderIndexes.value.left === index) return;

  updateLeftSlider(index);
  runVault();
}

function updateRightSliderDate(date: Date) {
  if (isDragging.value) return;

  const index = chartRef.value?.getItemIndexFromDate(dayjs.utc(date).format('YYYY-MM-DD'));
  if (sliderIndexes.value.right === index) return;

  updateRightSlider(index);
  runVault();
}

function startDrag(side: 'left' | 'right', event: PointerEvent) { 
  const elementLeftPos = side === 'left' ? sliderLeftPosX.value : sliderRightPosX.value;
  const otherSide = side === 'left' ? 'right' : 'left';
  const cursor = window.getComputedStyle(event.target as Element).cursor;
  
  const startX = event.clientX;

  isDragging.value = true;
  dragMeta = {
    side,
    startX,
    elemOffset: elementLeftPos - startX,
    elemLeftPos: elementLeftPos,
    startNibActive: nibsActive.value[side],
    startIndex: sliderIndexes.value[side],
    startIndexOther: sliderIndexes.value[otherSide],
    hasShiftKey: event.metaKey || event.shiftKey,
  };

  updateNibActiveBeforeDrag();
  dragMeta.isDraggingBoth = nibsActive.value.left && nibsActive.value.right;

  if (cursor === 'grab') {
    document.body.classList.add('isGrabbing');
  } else if (cursor === 'col-resize') {
    document.body.classList.add('isResizing');
  }
}

function onDrag(side: 'left' | 'right', event: PointerEvent) {
  if (!isDragging.value) return;
  hideInsight();

  const rawX = event.clientX;
  const currentX = rawX + dragMeta.elemOffset;
  const currentIndex = chartRef.value?.getItemIndexFromEvent(event, { x: currentX });  

  dragMeta.wasDragged = dragMeta.wasDragged || (currentIndex !== dragMeta.startIndex);

  if (dragMeta.isDraggingBoth) {
    const indexDiff = currentIndex - dragMeta.startIndex;
    if (dragMeta.side === 'left') {
      updateLeftSlider(dragMeta.startIndex + indexDiff, true);
      updateRightSlider(dragMeta.startIndexOther + indexDiff, true);
    } else {
      updateLeftSlider(dragMeta.startIndexOther + indexDiff, true);
      updateRightSlider(dragMeta.startIndex + indexDiff, true);
    }
  } else if (dragMeta.side === 'left') {
    updateLeftSlider(currentIndex, true);
  } else {
    updateRightSlider(currentIndex, true);
  }
  runVault();
}

function stopDrag(side: 'left' | 'right', event: PointerEvent) {
  isDragging.value = false;

  const rawX = event.clientX;
  const currentX = rawX + dragMeta.elemOffset;
  const currentIndex = chartRef.value?.getItemIndexFromEvent(event, { x: currentX });
  
  if (dragMeta.isDraggingBoth) {
    const indexDiff = currentIndex - dragMeta.startIndex;
    if (dragMeta.side === 'left') {
      updateLeftSlider(dragMeta.startIndex + indexDiff, true);
      updateRightSlider(dragMeta.startIndexOther + indexDiff, true);
    } else {
      updateLeftSlider(dragMeta.startIndexOther + indexDiff, true);
      updateRightSlider(dragMeta.startIndex + indexDiff, true);
    }
  } else if (dragMeta.side === 'left') {
    updateLeftSlider(currentIndex, true);
  } else {
    updateRightSlider(currentIndex, true);
  }
  runVault();

  document.body.classList.remove('isGrabbing');
  document.body.classList.remove('isResizing');

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

function updateLeftSlider(index: number, wasManuallyMoved: boolean = false) {
  hasDraggedSlider.value = hasDraggedSlider.value || wasManuallyMoved;
  if (index > sliderIndexes.value.right - 1) return;

  index = Math.max(index || 0, 0);
  basicStore.setConfig({ sliderIndexes: { left: index, right: sliderIndexes.value.right } });

  const startingItem = chartRef.value?.getItem(index);
  const pointPosition = chartRef.value?.getPointPosition(index);
  
  sliderLeftPosX.value = pointPosition.x;
  basicStore.setConfig({ sliderDates: { left: startingItem.date, right: sliderDates.value.right } });
  
  chartMarkerLeft.value.left = pointPosition.x;
  chartMarkerLeft.value.top = pointPosition.y;
  chartMarkerLeft.value.opacity = 1;
  chartMarkerLeft.value.item = startingItem;
}

function updateRightSlider(index: number, wasManuallyMoved: boolean = false) {
  hasDraggedSlider.value = hasDraggedSlider.value || wasManuallyMoved;
  if (index < sliderIndexes.value.left + 1) return;

  const maxIndex = chartRef.value?.getItemCount() - 1;
  index = Math.min(index || maxIndex, maxIndex);
  basicStore.setConfig({ sliderIndexes: { right: index, left: sliderIndexes.value.left } });
  
  const endingItem = chartRef.value?.getItem(index);
  const pointPosition = chartRef.value?.getPointPosition(index);

  sliderRightPosX.value = pointPosition.x;
  basicStore.setConfig({ sliderDates: { left: sliderDates.value.left, right: endingItem.date } });

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
  
  basicStore.setConfig({ bitcoinCount: Math.max(Math.round(bitcoinCount.value), 1) });
  purchasePrice.value = startingItem.price * bitcoinCount.value;

  basicStore.runVault(startingItem.date, endingItem.date, ratchetPct.value, activeShorts.value, bitcoinCount.value);

  actions.value = vaultSnapshot.value.actions;
}

function loadChartData() {
  const items: any[] = [];

  for (const [index, priceRecord] of btcPrices.all.entries()) {
    const item = {
      ...priceRecord,
      showPointOnChart: index === 0,
      fee: btcFees.getByDate(priceRecord.date),
      previous: items[index - 1],
      next: undefined,
    };
    items.push(item);
  }

  for (const [index, item] of items.entries()) {
    item.next = items[index + 1];
  }

  chartRef.value?.reloadData(items);
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
        newIndex = Math.min(newIndex + spaceBetween, maxIndex) - spaceBetween;
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
    updateLeftSlider(sliderIndexes.value.left + stepsToJump, true);    
    wasUpdated = true;
  }
  
  if (nibsActive.value.right) {
    updateRightSlider(sliderIndexes.value.right + stepsToJump, true);
    wasUpdated = true;
  }
  
  if (wasUpdated) {
    runVault();
  }
}

function highlightShort(short: IShort) {   
  const index = short.date === 'EXIT' ? sliderIndexes.value.right : chartRef.value?.getItemIndexFromDate(short.date);
  const position = chartRef.value?.getPointPosition(index);
  shortToHighlight.value = {
    isActive: true,
    left: position.x,
    top: position.y - 200,
    height: 200,
  };
}

function unhighlightShort() {   
  shortToHighlight.value.isActive = false;
}

emitter.on('highlight', (data: any) => {
  if (data.isStart) {
    highlightStart.value = true;
  } else if (data.isEnd) {
    highlightEnd.value = true;
  } else if (data.isRatchet) {
    const index = chartRef.value?.getItemIndexFromDate(data.date);
    const position = chartRef.value?.getPointPosition(index);
    ratchetToHighlight.value = {
      isActive: true,
      left: position.x,
      top: position.y - 200,
      height: 200,
    };
  }
});

emitter.on('unhighlight', (data: any) => {
  if (data.isStart) {
    highlightStart.value = false;
  } else if (data.isEnd) {
    highlightEnd.value = false;
  } else if (data.isRatchet) {
    ratchetToHighlight.value.isActive = false;
  }
});


Vue.watch(ratchetPct, (newVal: number) => {
  newVal = Math.max(newVal, 0);
  newVal = Math.min(newVal, 100);
  basicStore.setConfig({ ratchetPct: newVal });
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
  .text-shadow {
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
  }

  [VerticalLine] {
    box-shadow: 1px 1px 0 0 rgba(255, 255, 255, 0.5);
    background: linear-gradient(to bottom, rgba(71, 85, 105, 0.5) 0%, rgba(71, 85, 105, 0) 100%);
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

  [InlineInsight] {
    @apply -translate-y-0.5;
    &:before {
      content: '';
      position: absolute;
      left: -16px;
      top: 50%;
      margin-top: -14px;
      width: 0;
      height: 0;
      border-top: 18px solid transparent;
      border-bottom: 18px solid transparent;
      border-right: 16px solid rgba(148, 163, 184, 0.4);
    }
    &:after {
      content: '';
      position: absolute;
      left: -14.5px;
      top: 50%;
      margin-top: -14px;
      width: 0;
      height: 0;
      border-top: 18px solid transparent;
      border-bottom: 18px solid transparent;
      border-right: 16px solid #E6EAF3;
    }
  }


  [VideoLink] {
    [SolidIcon] {
      display: none;
    }
    [OutlineIcon] {
      display: inline-block;
    }
    &:hover {
      [SolidIcon] {
        display: inline-block;
      }
      [OutlineIcon] {
        display: none;
      }
    }
    svg path {
      fill: rgb(192 38 211) !important;
    }
  }
}
</style>