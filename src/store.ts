import * as Vue from 'vue';
import { defineStore } from 'pinia'
import baseRules, { IRules } from './lib/RulesConfig';
import API from './lib/API';
import BtcFees from './lib/BtcFees';
import BtcPrices from './lib/BtcPrices';
import Vault, { IAction } from './lib/Vault';

export type IPanelName =  'runner' | 'base';

export interface IVaultStats {
  ratchetCount: number;
  shortCount: number;
  cashUnlocked: number;
  vaulterProfit: number;
  hodlerProfit: number;
}

export const useBasicStore = defineStore('help', () => {
  const btcPrices = new BtcPrices();
  const btcFees = new BtcFees(btcPrices);
  const isLoaded: Vue.Ref<boolean> = Vue.ref(false);
  const tourStep: Vue.Ref<number> = Vue.ref(0);
  const finishedWelcomeOverlay: Vue.Ref<boolean> = Vue.ref(false);

  const ratchetPct = Vue.ref(10);
  const bitcoinCount = Vue.ref(1);

  const vault = Vue.ref<Vault | null>(null);
  const rules: Vue.Ref<IRules> = Vue.ref({ ...baseRules });

  const sliderIndexes: Vue.Ref<{ left: number, right: number }> = Vue.ref({ left: 3_698, right: 4_282 });
  const sliderDates: Vue.Ref<{ left: string, right: string }> = Vue.ref({ left: '2010-08-17', right: '2024-08-26' });

  const sliderLeft = Vue.ref(0);
  const sliderRight = Vue.ref(0);

  const vaultStats: Vue.Ref<IVaultStats> = Vue.ref({
    ratchetCount: 0,
    shortCount: 0,
    cashUnlocked: 0,
    vaulterProfit: 0,
    hodlerProfit: 0,
  });

  const positionChecks: Record<string, () => DOMRect> = {};

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

  function resetConfig() {

  }

  return { 
    isLoaded, 
    btcPrices, 
    btcFees, 
    vault,
    rules, 
    sliderIndexes, 
    sliderDates,
    sliderLeft,
    sliderRight,
    vaultStats,
    ratchetPct,
    bitcoinCount,
    tourStep,
    finishedWelcomeOverlay,
    loadData, 
    updateVaultStats,
    registerPositionCheck,
    getPositionCheck,
    resetConfig,
  }
});
