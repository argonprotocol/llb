import * as Vue from 'vue';
import { defineStore } from 'pinia'
import API from './lib/API';
import BtcFees from './lib/BtcFees';
import BtcPrices from './lib/BtcPrices';
import Vault, { IAction, IShort } from './lib/Vault';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export type IPanelName =  'runner' | 'base';

export interface IVaultStats {
  ratchetCount: number;
  shortCount: number;
  cashUnlocked: number;
  vaulterProfit: number;
  hodlerProfit: number;
}

const config = JSON.parse(sessionStorage.getItem('config') || '{}');
if (config.shorts) {
  config.shorts = config.shorts.map((s: any) => ({ date: s.date === 'EXIT' ? s.date : dayjs.utc(s.date), lowestPrice: s.lowestPrice }));
}

export const useBasicStore = defineStore('help', () => {
  const isLoaded: Vue.Ref<boolean> = Vue.ref(false);
  const btcPrices = new BtcPrices();
  const btcFees = new BtcFees(btcPrices);
  const vault = Vue.ref<Vault | null>(null);

  const tourStep: Vue.Ref<number> = Vue.ref(config.tourStep || 0);
  const completedWelcome: Vue.Ref<boolean> = Vue.ref(config.completedWelcome || false);

  const bitcoinCount = Vue.ref(config.bitcoinCount || 1);
  const ratchetPct = Vue.ref(config.ratchetPct || 10);

  const sliderIndexes: Vue.Ref<{ left: number, right: number }> = Vue.ref({ left: config.sliderIndexes?.left || 3_698, right: config.sliderIndexes?.right || 4_282 });
  const sliderDates: Vue.Ref<{ left: string, right: string }> = Vue.ref({ left: config.sliderDates?.left || '2010-08-17', right: config.sliderDates?.right || '2024-08-26' });

  const shorts: Vue.Ref<IShort[]> = Vue.ref(config.shorts || [
    { date: dayjs.utc('2022-01-18'), lowestPrice: 0.46 },
    { date: 'EXIT', lowestPrice: 0.001 },
  ]);
  
  const vaultStats: Vue.Ref<IVaultStats> = Vue.ref({
    ratchetCount: 0,
    shortCount: 0,
    cashUnlocked: 0,
    vaulterProfit: 0,
    hodlerProfit: 0,
  });

  const positionChecks: Record<string, () => DOMRect> = {};

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
  
  function updateVaultStats() {
    if (!vault.value) return;
    vaultStats.value = {
      ratchetCount: vault.value.actions.filter((a: IAction) => a.type === 'ratchet-up' || a.type === 'ratchet-down').length,
      shortCount: vault.value.shorts.length,
      cashUnlocked: vault.value.totalCashUnlocked,
      vaulterProfit: vault.value.vaulterProfit,
      hodlerProfit: vault.value.hodlerProfit,
    };
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
    vault, 

    ratchetPct,
    bitcoinCount,

    sliderIndexes, 
    sliderDates,
    shorts,
    vaultStats,
    tourStep,
    completedWelcome,
    loadData, 
    updateVaultStats,
    registerPositionCheck,
    getPositionCheck,
    resetConfig,
    setConfig,
  }
});
