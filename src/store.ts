import * as Vue from 'vue';
import { defineStore } from 'pinia'
import API from './lib/API';
import BtcFees from './lib/BtcFees';
import BtcPrices from './lib/BtcPrices';
import { IShort } from './lib/Vault';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import VaultSnapshot from './lib/VaultSnapshot';
import VaultQueue from './lib/VaultQueue';

dayjs.extend(utc);

export type IPanelName =  'runner' | 'base';

const config = JSON.parse(sessionStorage.getItem('config') || '{}');
if (config.shorts) {
  config.shorts = config.shorts.map((s: any) => ({ date: s.date === 'EXIT' ? s.date : dayjs.utc(s.date), lowestPrice: s.lowestPrice }));
}

export const useBasicStore = defineStore('help', () => {
  const isLoaded: Vue.Ref<boolean> = Vue.ref(false);
  const btcPrices = new BtcPrices();
  const btcFees = new BtcFees(btcPrices);

  const tourStep: Vue.Ref<number> = Vue.ref(config.tourStep || 0);
  const completedWelcome: Vue.Ref<boolean> = Vue.ref(config.completedWelcome || false);

  const bitcoinCount = Vue.ref(config.bitcoinCount || 1);
  const ratchetPct = Vue.ref(config.ratchetPct || 10);

  const sliderIndexes: Vue.Ref<{ left: number, right: number }> = Vue.ref({ left: config.sliderIndexes?.left || 3_698, right: config.sliderIndexes?.right || 4_282 });
  const sliderDates: Vue.Ref<{ left: string, right: string }> = Vue.ref({ left: config.sliderDates?.left || '2010-08-17', right: config.sliderDates?.right || '2024-08-26' });

  const vaultSnapshot = Vue.ref<VaultSnapshot>(new VaultSnapshot());
  const vaultQueue = new VaultQueue(vaultSnapshot);
  
  const shorts: Vue.Ref<IShort[]> = Vue.ref(config.shorts || [
    // { date: dayjs.utc('2021-03-18'), lowestPrice: 0.46 },
    // { date: 'EXIT', lowestPrice: 0.001 },
  ]);

  const positionChecks: Record<string, () => DOMRect> = {};

  function runVault(startingDate: string, endingDate: string, ratchetPct: number, shorts: IShort[], bitcoinCount: number) {
    if (!isLoaded.value) {
      console.error('Data not loaded');
      return;
    }
    vaultQueue.add(startingDate, endingDate, ratchetPct, shorts, bitcoinCount);
  }

  function setConfig(data: any) {
    tourStep.value = data.tourStep ?? tourStep.value;
    completedWelcome.value = data.completedWelcome ?? completedWelcome.value;
    bitcoinCount.value = data.bitcoinCount ?? bitcoinCount.value;
    ratchetPct.value = data.ratchetPct ?? ratchetPct.value;
    sliderIndexes.value = data.sliderIndexes ?? sliderIndexes.value;
    sliderDates.value = data.sliderDates ?? sliderDates.value;
    shorts.value = data.shorts ?? shorts.value;
    
    sessionStorage.setItem('config', JSON.stringify({
      tourStep: tourStep.value,
      completedWelcome: completedWelcome.value,
      bitcoinCount: bitcoinCount.value,
      ratchetPct: ratchetPct.value,
      sliderIndexes: sliderIndexes.value,
      sliderDates: sliderDates.value,
      shorts: shorts.value.map(s => ({ date: typeof s.date === 'string' ? s.date : s.date.toISOString(), lowestPrice: s.lowestPrice })),
    }));
  }

  function resetConfig() {
    sessionStorage.removeItem('config');
  }

  function registerPositionCheck(id: string, checkFn: () => DOMRect) {
    positionChecks[id] = checkFn;
  }

  function getPositionCheck(id: string) {
    const pos = positionChecks[id]();
    return {
      left: pos.left,
      top: pos.top,
      right: pos.right,
      bottom: pos.bottom,
    };
  }

  async function loadData() {
    const [a, b] = await Promise.all([
      API.fetchSimulationData('bitcoinPrices'),
      API.fetchSimulationData('bitcoinFeesPerTransaction')
    ]);
    btcPrices.load(a);
    btcFees.load(b);
    isLoaded.value = true;
  }

  return { 
    isLoaded, 
    btcPrices, 
    btcFees, 
    vaultSnapshot,

    ratchetPct,
    bitcoinCount,

    sliderIndexes, 
    sliderDates,
    shorts,
    tourStep,
    completedWelcome,

    loadData, 
    registerPositionCheck,
    getPositionCheck,
    resetConfig,
    runVault,
    setConfig,
  }
});
