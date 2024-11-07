<template>
  <div class="flex flex-col w-full">
    <ChartBg />
    <Chart ref="chartRef" :isRunning="true">
      <div StatusText v-if="statusText" :style="`left: ${statusTextPos.left}px; top: ${statusTextPos.top}px`" class="absolute z-20 -mt-3 font-bold text-slate-400 text-2xl">{{statusText}}</div>
    </Chart>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { useBasicStore } from '../stores/basic';
import API from '../lib/API';
import Chart from '../components/Chart.vue';
import ChartBg from '../components/ChartBg.vue';

const basicStore = useBasicStore();
const { switchToPanel } = basicStore;

const chartRef = Vue.ref<typeof Chart | null>(null);

const statusOptions = {
  1: ['STARTING MODEL...', 'LOADING BITCOIN PRICES...', 'INITIALIZING ARGON VAULTS...', 'RUNNING VAULT SCENARIOS...'],
}

const statusTextPos = Vue.ref({ left: 0, top: 0 });
const statusText = Vue.ref(statusOptions[1][0]);
const currentStatusIndex = Vue.ref(0);

let blockData = {
  bitcoinPrices: null as any,
  vaultingRatchets: null as any,
};

const updateStatusText = () => {
  if (currentStatusIndex.value < statusOptions[1].length) {
    statusText.value = statusOptions[1][currentStatusIndex.value];
    currentStatusIndex.value++;
    
    setTimeout(updateStatusText, 1000);
  } else {
    loadBitcoinPrices();
  }
};

async function loadBitcoinPrices() {
  if (!blockData.bitcoinPrices) {
    console.log('WAITING TO loadBitcoinPrices');
    setTimeout(loadBitcoinPrices, 100);
    return;
  };

  chartRef.value?.clearPoints();
  chartRef.value?.stopPulsing();
  statusText.value = '';
  
  let items: any[] = [];

  for (const [index, item] of blockData.bitcoinPrices.entries()) {
    item.showPointOnChart = index === 0;
    item.previous = blockData.bitcoinPrices[index - 1];
    items.push(item);

    if (index % 20 === 0) {
      const pointPos = chartRef.value?.addPoints(items);
      updateStatusTextPos(pointPos);
      items = [];
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  const pointPos = chartRef.value?.addPoints(items);
  updateStatusTextPos(pointPos);
  navigateToBase();
}

function navigateToBase() {
  if (!blockData.vaultingRatchets) {
    console.log('WAITING TO navigateToBase');
    setTimeout(navigateToBase, 100);
    return;
  }
  switchToPanel('base');
}

async function loadData() {
  blockData.bitcoinPrices = await API.fetchSimulationData('bitcoinPrices', { rules: basicStore.rules });
  chartRef.value?.setDateRange(blockData.bitcoinPrices[0].date, blockData.bitcoinPrices[blockData.bitcoinPrices.length - 1].date);
  await API.fetchSimulationData('vaultingRatchets', { rules: basicStore.rules }).then(data => blockData.vaultingRatchets = data);
}

function updateStatusTextPos(pos: { x: number, y: number }) {
  if (!pos) return;
  statusTextPos.value.left = pos.x + 35;
  statusTextPos.value.top = pos.y;
}

Vue.onMounted(() => {
  const pointPos = chartRef.value?.addPoints([{ date: '2010-08-17', price: 0.07, showPointOnChart: true }]);
  chartRef.value?.startPulsing();
  updateStatusTextPos(pointPos);
  updateStatusText(); // Start the sequence
});

loadData().catch(console.error);
</script>

<style lang="scss" scoped>
[StatusText] {
  transform: translateY(-50%);
  animation: textPulse 1s infinite;
}

@keyframes textPulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.3;
  }
}
</style>