<template>
  <div ref="componentElement" class="Base Component relative pt-2 -mt-2 h-full flex flex-col overflow-hidden">
    <div class="h-full flex flex-col relative" @mousedown="startDrag">
      
      <div class="absolute w-full h-full flex flex-col pointer-events-none z-[600]">
        <p ChartCallout class="CalloutText absolute top-6 left-7 w-5/12 pr-40 z-20">
          Liquid Locking allows bitcoin holders to lock their assets into yield bearing Argon Vaults. The more bitcoins locked in vaults the larger the wall of shorts stabilizing the argon. 
          <span class="text-blue-500 underline decoration-dashed cursor-pointer">Learn more</span>.
        </p>
      </div>
      
      <div @click="clickTest" class="grow relative">
        <div :style="`width: ${sliderLeft}px;`" class="absolute left-0 top-0 bottom-[47px] bg-[#E6EAF3] z-[500] opacity-50"></div>
        <div SelectedLine :style="`left: ${sliderLeft}px;`" :class="{ isActive: nibsActive.left }" class="Left absolute -top-1 bottom-3 bg-white w-2 border-2 border-slate-800/40 rounded-full z-[500] cursor-col-resize">
          <TriangleNib @click="toggleNib('left', $event)" class="absolute left-1/2 bottom-0 w-6 h-6 ml-[0.5px] -translate-x-1/2 translate-y-1/2 cursor-grab" />
          <TriangleNibBasic class="Selected absolute left-1/2 bottom-0 w-4 h-4 ml-[0.5px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        </div>

        <div :style="`left: ${sliderRight}px`" class="absolute right-0 top-0 bottom-[47px] bg-[#E6EAF3] z-[500] opacity-50"></div>
        <div SelectedLine :style="`left: ${sliderRight}px`" :class="{ isActive: nibsActive.right }" class="Right absolute -top-1 bottom-3 bg-white w-2 border-2 border-slate-800/40 rounded-full shadow-xl z-[500] cursor-col-resize">
          <TriangleNib @click="toggleNib('right', $event)" class="absolute left-1/2 bottom-0 w-6 ml-[0.5px] h-6 -translate-x-1/2 translate-y-1/2 cursor-grab" />
          <TriangleNibBasic class="Selected absolute left-1/2 bottom-0 w-4 h-4 ml-[0.5px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        </div>

        <ChartBg />
        <Chart @dragging="onDragging" ref="chartRef">
          <template v-for="ratchet of ratchets" :key="ratchet.date">
            <div v-if="ratchet.profitIncreasePct" :style="`left: ${ratchet.left}px; top: ${ratchet.profitTop}px; height: ${ratchet.profitHeight}px`" class="absolute -mt-3 font-bold text-slate-400">
              <span class="text-green-600/70 relative z-30 text-sm">{{ formatShorthandNumber(ratchet.profitIncreasePct) }}%</span>
              <div VerticalLine class="absolute left-1/2 top-5 bottom-0 bg-slate-400/30 w-[1px]"></div>
            </div>
            <div v-else-if="ratchet.isDownRatchet" :style="`left: ${ratchet.left}px; top: ${ratchet.iconTop}px; height: ${ratchet.iconHeight}px`" class="absolute -mt-3 font-bold text-slate-400">
              <LockIcon Icon class="w-3 h-3 relative z-30" />
              <div VerticalLine class="absolute left-1/2 top-5 bottom-0 bg-slate-400/30 w-[1px]"></div>
            </div>
          </template>
        </Chart>
      </div>
    
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useBasicStore } from '../stores/basic';
import Chart from '../components/Chart.vue';
import ChartBg from '../components/ChartBg.vue';
import LockIcon from '../assets/lock.svg';
import TriangleNib from '../assets/triangle-nib.svg';
import TriangleNibBasic from '../assets/triangle-nib-basic.svg';
import { storeToRefs } from 'pinia';
import { addCommas, calculateProfit, formatShorthandNumber } from '../lib/BasicUtils';

dayjs.extend(utc);

const basicStore = useBasicStore();
const { getSimulationData, switchToPanel } = basicStore;
const { sliderIndexes, sliderDates, traderReturns } = storeToRefs(basicStore);

const chartRef = Vue.ref<typeof Chart | null>(null);

const isDragging = Vue.ref(false);
const componentElement = Vue.ref(null);

const ratchets: Vue.Ref<any[]> = Vue.ref([]);

const startDragMeta: { startX: number, side: string | null } = Vue.ref({ startX: 0, side: null });

const dragMeta: any = {};
const selector = Vue.ref({ left: 0, width: 0, isActive: false });
const dragSelection: Vue.Ref<null | any> = Vue.ref();

const nibsActive = Vue.ref({ left: false, right: false });

function toggleNib(side: 'left' | 'right', event: MouseEvent) {
  nibsActive.value[side] = !nibsActive.value[side];
  
  if (!event.metaKey && !event.shiftKey) {
    const otherSide = side === 'left' ? 'right' : 'left';
    nibsActive.value[otherSide] = false;
  }
}

function clickTest(event: MouseEvent) {
  const item = chartRef.value?.getItemFromEvent(event);
  // console.log('clickTest', item);
}

function onDragging(response: any) {
  dragSelection.value = response;
}

function startDrag(event: MouseEvent) {
  const targetElem = event.target as HTMLElement;
  const hasSelectionAttribute = targetElem.hasAttribute('Selection') || targetElem.parentElement?.hasAttribute('Selection');
  if (hasSelectionAttribute) {
    return;
  }

  isDragging.value = true;
  dragMeta.startX = event.clientX;
  setSelectorPos(event.clientX, event.clientX);
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(event: MouseEvent) {
  if (!isDragging.value) return;

  setSelectorPos(dragMeta.startX, event.clientX);
  // console.log('dragging', dragMeta.startX, event.clientX);

  // const deltaXBaseline = event.clientX

  // console.log('onDrag');
}

function stopDrag(event: MouseEvent) {
  isDragging.value = false;

  setSelectorPos(dragMeta.startX, event.clientX);

  // console.log('stopDrag', dragMeta.startX, event.clientX);

  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function setSelectorPos(startPos: number, currentPos: number) {
  const left = Math.min(startPos, currentPos);
  const right = Math.max(startPos, currentPos);

  selector.value.left = left;
  selector.value.width = right - left;
  
  selector.value.isActive = (left !== right);
}

const sliderLeft = Vue.ref(0);
const sliderRight = Vue.ref(0);

function updateSliders() {
  const leftIndex = sliderIndexes.value.left;
  const rightIndex = sliderIndexes.value.right;

  const pointLeft = chartRef.value?.getPointPosition(leftIndex);
  const pointRight = chartRef.value?.getPointPosition(rightIndex);

  sliderLeft.value = pointLeft.x;
  sliderRight.value = pointRight.x;

  const startingItem = chartRef.value?.getItem(leftIndex);
  const endingItem = chartRef.value?.getItem(rightIndex);

  traderReturns.value.hodler = calculateProfit(startingItem.price, endingItem.price);
  sliderDates.value = { left: startingItem.date, right: endingItem.date };

  let vaulterValue = startingItem.price;
  let lastRatchet: any = null;
  
  // Loop through all points between the sliders
  for (let i = sliderIndexes.value.left; i <= sliderIndexes.value.right; i++) {
    const item = chartRef.value?.getItem(i);
    const ratchet = item.ratchet;
    if (!ratchet) continue;
    const expenses = ratchet.securityFee + ratchet.btcTransactionFee;
    vaulterValue += ratchet.argonsMinted - (ratchet.argonsBurned + expenses);
    lastRatchet = ratchet;
  }

  if (lastRatchet) {
    vaulterValue += endingItem.price - lastRatchet.price;
  }

  traderReturns.value.vaulter = calculateProfit(startingItem.price, vaulterValue);
}

function loadData() {
  const allItems: any[] = [];
  const bitcoinPrices = getSimulationData('bitcoinPrices');
  const vaultingRatchets = getSimulationData('vaultingRatchets');
  const vaultingRatchetsByDate: any = {};

  if (!bitcoinPrices || !vaultingRatchets) {
    switchToPanel('runner');
  }
  
  for (const ratchet of vaultingRatchets.values()) {
    vaultingRatchetsByDate[ratchet.date] = ratchet;
  }

  for (const [index, item] of bitcoinPrices.entries()) {
    item.showPointOnChart = index === 0;
    item.previous = bitcoinPrices[index - 1];
    if (vaultingRatchetsByDate[item.date]) {
      item.ratchet = vaultingRatchetsByDate[item.date];
      vaultingRatchetsByDate[item.date].itemIndex = index;
    }
    
    allItems.push(item);
  }

  chartRef.value?.reloadData(allItems);
  updateSliders()

  let adjustUpward = true;
  let adjustAmount = 15;
  
  let hodlerBase = allItems[0].price;
  let vaulterBase = allItems[0].price;
  let vaulterExpenses = 0;

  for (const [index, ratchet] of vaultingRatchets.entries()) {
    const previousPrice = vaultingRatchets[index - 1]?.price || allItems[0].price;
    const isUpRatchet = ratchet.price > previousPrice;
    
    vaulterExpenses += ratchet.securityFee + ratchet.btcTransactionFee;

    const hodlerProfit = calculateProfit(hodlerBase, ratchet.price);
    const vaulterProfit = calculateProfit(vaulterBase + vaulterExpenses, ratchet.price);
    const profitIncreasePct = isUpRatchet ? Math.max(0, vaulterProfit - hodlerProfit) * 100 : 0;

    const priceChangePct = calculateProfit(previousPrice, ratchet.price) * 100;

    if (ratchet.price > hodlerBase) {
      hodlerBase = ratchet.price;
    }
    if (isUpRatchet) {
      vaulterExpenses = ratchet.securityFee + ratchet.btcTransactionFee;
    }
    vaulterBase = ratchet.price;

    const pointPos = chartRef.value?.getPointPosition(ratchet.itemIndex);
    const profitTop = pointPos.y - (pointPos.y * .4) - 100;
    const iconTop = pointPos.y - (pointPos.y * .1) - 100;;
    
    const newRatchet = { 
      ...ratchet, 
      left: pointPos.x, 
      profitTop: profitTop,
      profitHeight: pointPos.y - profitTop,
      iconTop: iconTop,
      iconHeight: pointPos.y - iconTop,
      profitIncreasePct: profitIncreasePct,
      priceChangePct: priceChangePct,
      isDownRatchet: !isUpRatchet,
    };

    // Adjust the top if there are ratchets within 10 units
    if (isUpRatchet) {
      const ratchetsToCheck = ratchets.value.slice(ratchets.value.length - 20);
      const profitIncreasePcts = ratchetsToCheck.map(r => r.profitIncreasePct);
      const minValue = Math.min(...profitIncreasePcts);
      const maxValue = Math.max(...profitIncreasePcts);
      const pctMove = (newRatchet.profitIncreasePct - minValue) / (maxValue - minValue);
      for (const existingRatchet of ratchetsToCheck) {
        if (Math.abs(existingRatchet.left - newRatchet.left) < 5) {
          newRatchet.profitTop -= (adjustUpward ? adjustAmount : -adjustAmount) * pctMove;
          newRatchet.profitHeight += (adjustUpward ? adjustAmount : -adjustAmount) * pctMove;
        }
      }
    } else {
      for (let i = ratchets.value.length - 1; i >= Math.max(0, ratchets.value.length - 20); i--) {
        const existingRatchet = ratchets.value[i];
        if (existingRatchet.priceChangePct > 0) continue;
        if (Math.abs(existingRatchet.left - newRatchet.left) < 8) {
          newRatchet.iconTop -= adjustUpward ? adjustAmount : -adjustAmount;
          newRatchet.iconHeight += adjustUpward ? adjustAmount : -adjustAmount;
        }
      }
    }

    adjustUpward = !adjustUpward;
    ratchets.value.push(newRatchet);
  }
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
    sliderIndexes.value.left += stepsToJump
    wasUpdated = true;
  }
  
  if (nibsActive.value.right) {
    sliderIndexes.value.right += stepsToJump
    wasUpdated = true;
  }
  
  if (wasUpdated) {
    updateSliders();
  }
}

Vue.onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  loadData();
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

  [SelectedLine] {
    svg.Selected {
        display: none;
      }
    &.isActive {
      svg.Selected {
        display: block;
      }
      &:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 1px;
        right: 1px;
        background: #63298E;
      }
    }

    &.Left {
      box-shadow: -10px 1px 12px 0px rgba(0, 0, 0, .1);
    }

    &.Right {
      box-shadow: 10px 1px 12px 0px rgba(0, 0, 0, .1);
    }
  }

  .CalloutText {
    @apply font-light text-slate-400 select-none;
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
    &:hover {
      @apply text-slate-500;
    }
  }

  [Selection] {
    box-shadow: 1px 1px 1px 0 rgb(0 0 0), inset 1px 1px 1px 0 rgb(0 0 0);
  }

  [Selection]:hover {
    border-color: #91bcdf;
    [SelectionBg] {
      background: rgba(230, 234, 243, 0.5);
    }
  }
  [SelectionBg] {
    @apply absolute top-0 bottom-0 left-0 right-0;
    background: rgba(230, 234, 243, 0.4);
  }
  [EdgeLeft] {
    @apply absolute top-0 bottom-0 -left-2 w-3 cursor-col-resize;
  }
  [EdgeRight] {
    @apply absolute top-0 bottom-0 -right-2 w-2 cursor-col-resize;
  }
}
</style>