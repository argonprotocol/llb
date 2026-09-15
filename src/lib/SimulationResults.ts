import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useBasicStore } from '../store';
import { addCommas, formatChangePct, formatShorthandNumber } from './BasicUtils';
import { hideInsight, showInsight } from './InsightUtils';

export function useSimulationResults() {
  const store = useBasicStore();
  const { vaultSnapshot, calculationState, calculationError } = storeToRefs(store);
  const stats = computed(() => {
    const s = vaultSnapshot.value;
    const percentage = (value: number) => s.isLoaded ? addCommas(formatChangePct(value)) + '%' : '—';
    const color = (value: number) => value > 0 ? 'text-green-700' : value < 0 ? 'text-red-700' : '';
    return [
      { id: 'vaulterReturns', label: 'Liquid returns', value: percentage(s.vaulterProfit), color: color(s.vaulterProfit) },
      { id: 'hodlerReturns', label: 'Hodling returns', value: percentage(s.hodlerProfit), color: color(s.hodlerProfit) },
      { id: 'ratchets', label: s.ratchetCount === 1 ? 'Ratchet' : 'Ratchets', value: s.isLoaded ? addCommas(s.ratchetCount) : '—', color: '' },
      { id: 'shorts', label: s.shortCount === 1 ? 'Argon Short' : 'Argon Shorts', value: s.isLoaded ? addCommas(s.shortCount) : '—', color: '' },
      { id: 'cashUnlocked', label: 'Accrued cash', value: s.isLoaded ? '$' + formatShorthandNumber(s.totalCashUnlocked) : '—', color: '' },
    ];
  });
  function show(event: MouseEvent, sticky = true) {
    const s = vaultSnapshot.value;
    if (!s.inputs) return;
    showInsight(event, {
      ...s, bitcoinCount: s.bitcoinCount, startingDate: s.inputs.startingDate, endingDate: s.inputs.endingDate,
      startingBtcValue: s.startingPrice * s.bitcoinCount, endingBtcValue: s.endingPrice * s.bitcoinCount,
      profitFromRatchets: s.totalAccruedValue + s.totalExpenses - (s.profitFromInitialLock + s.profitFromShorts + s.endingPrice * s.bitcoinCount),
    }, sticky);
  }
  function hover(event: MouseEvent) { if (window.matchMedia('(hover: hover)').matches) show(event, false); }
  return { store, vaultSnapshot, calculationState, calculationError, stats, show, hover, hideInsight };
}
