import * as Vue from 'vue';
import { defineStore } from 'pinia'
import baseRules, { IRules } from '../lib/RulesConfig';
import { IStageName } from '../lib/API';
import CompressedStorage from 'compressedstorage';

const compressedStorage = CompressedStorage(window.sessionStorage);

export type IPanelName =  'runner' | 'base';

export const useBasicStore = defineStore('help', () => {
  const selectedPanel: Vue.Ref<IPanelName> = Vue.ref(compressedStorage.getItem('selectedPanel') as IPanelName || 'base');

  const rules: Vue.Ref<IRules> = Vue.ref({ ...baseRules });
  const simulationData: Vue.Ref<any> = Vue.ref({
    bitcoinPrices: getSimulationDataFromLocalStorage('bitcoinPrices'),
    vaultingRatchets: getSimulationDataFromLocalStorage('vaultingRatchets'),
  });

  const sliderIndexes: Vue.Ref<{ left: number, right: number }> = Vue.ref({ left: 3_698, right: 4_283 });
  const sliderDates: Vue.Ref<{ left: string, right: string }> = Vue.ref({ left: '2010-08-17', right: '2024-08-26' });
  const traderReturns: Vue.Ref<{ hodler: number, vaulter: number }> = Vue.ref({ hodler: 0, vaulter: 0 });

  function switchToPanel(name: IPanelName) {
    selectedPanel.value = name;
    compressedStorage.setItem('selectedPanel', name);
  }

  function saveSimulationData(stage: IStageName, data: any) {
    compressedStorage.setItem(`simulationData-${stage}`, JSON.stringify(data));
  }

  function getSimulationData(stage: IStageName) {
    return simulationData.value[stage as keyof typeof simulationData.value] || getSimulationDataFromLocalStorage(stage);
  }

  function resetToDefault() {
    sessionStorage.removeItem('selectedPanel');
    sessionStorage.removeItem('simulationData-bitcoinPrices');
    sessionStorage.removeItem('simulationData-vaultingRatchets');
  }

  return { rules, selectedPanel, sliderIndexes, sliderDates, traderReturns, switchToPanel, saveSimulationData, getSimulationData, resetToDefault }
});

function getSimulationDataFromLocalStorage(stage: IStageName) {
  const dataString = compressedStorage.getItem(`simulationData-${stage}`);
  if (dataString) {
    try {
      return JSON.parse(dataString);
    } catch (e) {
      console.error('Error parsing simulation data', e);
    }
  }
  return undefined;
}
