import * as Vue from 'vue';
import { defineStore } from 'pinia'
import baseRules, { IRules } from './lib/RulesConfig';
import API from './lib/API';
import BtcFees from './lib/BtcFees';
import BtcPrices from './lib/BtcPrices';

export type IPanelName =  'runner' | 'base';

export interface IVaultStats {
  ratchetCount: number;
  shortCount: number;
  liquidCash: number;
  vaulterProfit: number;
  hodlerProfit: number;
}

export const useBasicStore = defineStore('help', () => {
  const btcPrices = new BtcPrices();
  const btcFees = new BtcFees(btcPrices);
  const isLoaded: Vue.Ref<boolean> = Vue.ref(false);

  const ratchetPct = Vue.ref(10);

  const rules: Vue.Ref<IRules> = Vue.ref({ ...baseRules });

  const sliderIndexes: Vue.Ref<{ left: number, right: number }> = Vue.ref({ left: 3_698, right: 4_282 });
  const sliderDates: Vue.Ref<{ left: string, right: string }> = Vue.ref({ left: '2010-08-17', right: '2024-08-26' });

  const vaultStats: Vue.Ref<IVaultStats> = Vue.ref({
    ratchetCount: 0,
    shortCount: 0,
    liquidCash: 0,
    vaulterProfit: 0,
    hodlerProfit: 0,
  });

  function updateVaultStats(data: IVaultStats) {
    vaultStats.value = data;
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
    rules, 
    sliderIndexes, 
    sliderDates,
    vaultStats,
    ratchetPct,
    loadData, 
    updateVaultStats,
  }
});
