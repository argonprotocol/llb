<template>
  <div ref="componentElement" class="Base Component relative pt-2 -mt-2 h-full flex flex-col overflow-hidden select-none">
    <div class="h-full flex flex-col relative">
      
      <!-- <div class="absolute w-full h-full flex flex-col pointer-events-none z-[600]">
        <p ChartCallout class="CalloutText absolute top-6 left-7 w-5/12 pr-40 z-20">
          Liquid Locking allows bitcoin holders to lock their assets into yield bearing Argon Vaults. The more bitcoins locked in vaults the larger the wall of shorts stabilizing the argon. 
          <span class="text-blue-500 underline decoration-dashed cursor-pointer">Learn more</span>.
        </p>
      </div> -->
      
      <div class="absolute left-20 top-[20%] flex flex-col z-[600] w-1/3 pb-20">
        
        <section class="divide-y divide-slate-400/40 border-b border-slate-400/40">
          <h3 class="py-1 font-semibold">CONFIGURE YOUR BITCOIN</h3>
          <div class="py-1">
            Bitcoin enters Vault on {{ dayjs(sliderDates.left).format('MMMM D, YYYY') }}
          </div>
          <div class="py-1">
            Bitcoin exits Vault on {{ dayjs(sliderDates.right).format('MMMM D, YYYY') }}
          </div>
          <div class="py-1">
            Ratchet whenever Bitcoin's price changes by <input type="text" @keydown="handleRatchetPctKeyPress" class="w-10 px-2 py-0 bg-transparent rounded border-slate-400/60" v-model="ratchetPct" />% or more
          </div>
        </section>

        <section class="divide-y divide-slate-400/40 border-b border-slate-400/40 mt-4">
          <h3 class="py-1 font-semibold">
            CONFIGURE ARGON PRICE DROPS 
            <span class="text-slate-400/60">(</span><span class="text-fuchsia-700 cursor-pointer">ADD</span><span class="text-slate-400/60">)</span></h3>
          <div v-for="short of shorts" :key="short.date" class="py-1">
            On {{ dayjs(short.date).format('MMMM D, YYYY') }} Argon drops from $1.00 to ${{ short.lowestPrice }}
          </div>
        </section>

        <div class="absolute bottom-0 flex flex-row space-x-4 whitespace-nowrap">
          <button @click="showActionsList" class="border border-slate-400 text-fuchsia-700 py-2 px-6 rounded-md bg-white/50 hover:bg-white/100">
            {{ showingActionsList ? 'Viewing' : 'View' }} Ratchets List
          </button>
          <button class="border border-slate-400 text-fuchsia-700 py-2 px-6 rounded-md bg-white/50 hover:bg-white/100">
            Download Raw Data
          </button>
        </div>
      </div>

      <div @click="clickTest" class="grow relative">
        <NibSlider @mousedown="startDrag('left', $event)" @toggle="toggleNib('left', $event)" position="left" :pos="sliderLeft" :isActive="nibsActive.left" />
        <NibSlider @mousedown="startDrag('right', $event)" @toggle="toggleNib('right', $event)" position="right" :pos="sliderRight" :isActive="nibsActive.right" />

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
import Vault from '../lib/Vault';
import emitter from '../emitters/basic';
import NibSlider from '../components/NibSlider.vue';

dayjs.extend(utc);

const basicStore = useBasicStore();
const { btcPrices, btcFees } = basicStore;
const { sliderIndexes, sliderDates } = storeToRefs(basicStore);

const chartRef = Vue.ref<typeof Chart | null>(null);

const isDragging = Vue.ref(false);
const componentElement = Vue.ref(null);

const ratchetPct = Vue.ref(10);

const dragMeta: any = {};

const nibsActive = Vue.ref({ left: false, right: false });

const sliderLeft = Vue.ref(0);
const sliderRight = Vue.ref(0);

let vault = Vue.ref<Vault | null>(null);

const shorts = Vue.ref([
  { date: '2022-01-06', lowestPrice: 0.001 },
  { date: '2022-03-09', lowestPrice: 0.46 },
]);

function handleRatchetPctKeyPress(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    ratchetPct.value += 1;
  } else if (event.key === 'ArrowDown') {
    ratchetPct.value -= 1;
  }
}

function toggleNib(side: 'left' | 'right', event: MouseEvent) {
  nibsActive.value[side] = !nibsActive.value[side];
  
  if (!event.metaKey && !event.shiftKey) {
    const otherSide = side === 'left' ? 'right' : 'left';
    nibsActive.value[otherSide] = false;
  }
}

let showingActionsList = Vue.ref(false);

function showActionsList(event: MouseEvent) {
  const targetElem = event.target as HTMLElement;
  const rect = targetElem.getBoundingClientRect();
  const left = rect.left;
  const bottomFromTop = rect.bottom - rect.height;
  if (showingActionsList.value) {
    showingActionsList.value = false;
    emitter.emit('hideActionsList');
    return;
  }

  showingActionsList.value = true;
  emitter.emit('showActionsList', { actions: vault?.actions, left, bottomFromTop });
}

function clickTest() {
  // event: MouseEvent
  // const itemIndex = chartRef.value?.getItemIndexFromEvent(event);
  // console.log('clickTest', itemIndex);
}

function startDrag(position: 'left' | 'right', event: MouseEvent) { 
  const elementLeftPos = position === 'left' ? sliderLeft.value : sliderRight.value;
  isDragging.value = true;
  dragMeta.position = position;
  dragMeta.startX = event.clientX;
  dragMeta.elemOffset = elementLeftPos - dragMeta.startX;
  dragMeta.elemLeftPos = elementLeftPos;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(event: MouseEvent) {
  if (!isDragging.value) return;

  const currentX = event.clientX + dragMeta.elemOffset;
  const itemIndex = chartRef.value?.getItemIndexFromEvent(event, { x: currentX });
  
  if (dragMeta.position === 'left') {
    updateLeftSlider(itemIndex);
  } else {
    updateRightSlider(itemIndex);
  }
  runVault();
}

function stopDrag(event: MouseEvent) {
  isDragging.value = false;

  const currentX = event.clientX + dragMeta.elemOffset;
  const itemIndex = chartRef.value?.getItemIndexFromEvent(event, { x: currentX });
  
  if (dragMeta.position === 'left') {
    updateLeftSlider(itemIndex);
  } else {
    updateRightSlider(itemIndex);
  }
  runVault();

  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function updateLeftSlider(index: number) {
  if (index > sliderIndexes.value.right - 1) return;
  sliderIndexes.value.left = index;
  const startingItem = chartRef.value?.getItem(index);

  sliderLeft.value = chartRef.value?.getPointPosition(index).x;
  sliderDates.value.left = startingItem.date;
}

function updateRightSlider(index: number) {
  if (index < sliderIndexes.value.left + 1) return;
  sliderIndexes.value.right = index;
  const endingItem = chartRef.value?.getItem(index);
  sliderRight.value = chartRef.value?.getPointPosition(index).x;
  sliderDates.value.right = endingItem.date;
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
  console.log('ratchetPct1', newVal);
  ratchetPct.value = Math.max(newVal, 1);
  ratchetPct.value = Math.min(ratchetPct.value, 100);
  console.log('ratchetPct2', ratchetPct.value);
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
.Base.Component {
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
}
</style>