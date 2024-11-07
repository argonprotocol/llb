import * as Vue from 'vue';
import { defineStore } from 'pinia'
import baseRules, { IRules } from './lib/RulesConfig';
import API from './lib/API';

export type IPanelName =  'runner' | 'base';

export const useBasicStore = defineStore('help', () => {
  const bitcoinPrices: Vue.Ref<any> = Vue.ref(null);
  const bitcoinFeesPerTransaction: Vue.Ref<any> = Vue.ref(null);
  const isLoaded: Vue.Ref<boolean> = Vue.ref(false);
  
  const rules: Vue.Ref<IRules> = Vue.ref({ ...baseRules });

  const sliderIndexes: Vue.Ref<{ left: number, right: number }> = Vue.ref({ left: 3_698, right: 4_283 });
  const sliderDates: Vue.Ref<{ left: string, right: string }> = Vue.ref({ left: '2010-08-17', right: '2024-08-26' });
  const traderReturns: Vue.Ref<{ hodler: number, vaulter: number }> = Vue.ref({ hodler: 0, vaulter: 0 });

  async function loadData() {
    const [a, b] = await Promise.all([
      API.fetchSimulationData('bitcoinPrices'),
      API.fetchSimulationData('bitcoinFeesPerTransaction')
    ]);
    bitcoinPrices.value = a;
    bitcoinFeesPerTransaction.value = b;
    isLoaded.value = true;
  }

  return { 
    isLoaded, 
    bitcoinPrices, 
    bitcoinFeesPerTransaction, 
    rules, 
    sliderIndexes, 
    sliderDates,
    traderReturns, 
    loadData, 
  }
});
