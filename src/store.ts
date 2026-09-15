import { computed, onScopeDispose, ref, shallowRef, toRaw } from 'vue';
import { defineStore } from 'pinia';
import BitcoinFees from './lib/BitcoinFees';
import BitcoinPrices from './lib/BitcoinPrices';
import type { IClonableShort } from './lib/Vault';
import VaultSnapshot from './lib/VaultSnapshot';
import VaultQueue, { type CalculationState } from './lib/VaultQueue';
import VaultWorker from './workers/worker.ts?worker';
import Download from './lib/Download';
import { createDateDomain, dateOnly, isActiveDrop, normalizeNumber, restoreScenario, validatePriceDrop, type DateRange, type Scenario } from './lib/ScenarioConfig';
import argonTarget from './data/argonTarget.json';

export const useBasicStore = defineStore('help', () => {
  let saved: Record<string, any> = {};
  try { saved = JSON.parse(sessionStorage.getItem('config') || '{}'); } catch { /* Restore defaults for an unreadable session. */ }
  if (!saved || typeof saved !== 'object') saved = {};
  const bitcoinPrices = new BitcoinPrices();
  const bitcoinFees = new BitcoinFees();
  const dateDomain = createDateDomain(bitcoinPrices.prices);
  const restored = restoreScenario(saved, dateDomain, argonTarget.usdTargetForArgon);
  const isLoaded = ref(false);
  const tourStep = ref(Number.isInteger(saved.tourStep) && saved.tourStep >= 0 && saved.tourStep <= 4 ? saved.tourStep : 0);
  const completedWelcome = ref(saved.completedWelcome === true);
  const bitcoinCount = ref(restored.bitcoinCount);
  const ratchetPct = ref(restored.ratchetPct);
  const sliderDates = ref(restored.sliderDates);
  const sliderIndexes = computed(() => ({
    left: dateDomain.indexByDate.get(sliderDates.value.left)!,
    right: dateDomain.indexByDate.get(sliderDates.value.right)!,
  }));
  const shorts = ref<IClonableShort[]>(restored.shorts);
  const activeShorts = computed(() => shorts.value.filter(short => isActiveDrop(short, sliderDates.value)));
  const purchasePrice = computed(() => bitcoinPrices.prices[sliderIndexes.value.left].price * bitcoinCount.value);
  const vaultSnapshot = shallowRef(new VaultSnapshot());
  const calculationState = ref<CalculationState>('idle');
  const calculationError = ref('');
  const requestedId = ref(0);
  const canExport = computed(() => calculationState.value === 'ready' && vaultSnapshot.value.isLoaded && vaultSnapshot.value.requestId === requestedId.value);
  const queue = new VaultQueue(
    () => new VaultWorker(),
    snapshot => { vaultSnapshot.value = snapshot; },
    (state, error) => { calculationState.value = state; calculationError.value = error || ''; },
  );

  function persist() {
    try { sessionStorage.setItem('config', JSON.stringify({
      tourStep: tourStep.value, completedWelcome: completedWelcome.value,
      bitcoinCount: bitcoinCount.value, ratchetPct: ratchetPct.value,
      sliderIndexes: sliderIndexes.value, sliderDates: sliderDates.value,
      shorts: shorts.value,
    })); } catch { /* A browser that blocks storage can still run the simulator. */ }
  }
  let persistFrame: number | null = null;
  function schedulePersist() {
    if (persistFrame !== null) return;
    persistFrame = requestAnimationFrame(() => { persistFrame = null; persist(); });
  }
  function flushPersist() {
    if (persistFrame !== null) { cancelAnimationFrame(persistFrame); persistFrame = null; persist(); }
  }
  function runVault() {
    if (!isLoaded.value) return;
    requestedId.value = queue.add({
      startingDate: sliderDates.value.left, endingDate: sliderDates.value.right,
      bitcoinCount: bitcoinCount.value, ratchetPct: ratchetPct.value,
      shorts: activeShorts.value, usdTargetForArgon: argonTarget.usdTargetForArgon,
      argonTargetUpdatedAt: argonTarget.lastUpdatedAt,
    });
  }
  function commitScenario(change: Partial<Scenario>) {
    const dates: DateRange = { ...sliderDates.value, ...change.sliderDates };
    dateDomain.validate(dates);
    const quantity = normalizeNumber(change.bitcoinCount ?? bitcoinCount.value, 'bitcoinCount');
    const threshold = normalizeNumber(change.ratchetPct ?? ratchetPct.value, 'ratchetPct');
    const drops = change.shorts ?? shorts.value;
    const changed = dates.left !== sliderDates.value.left || dates.right !== sliderDates.value.right ||
      quantity !== bitcoinCount.value || threshold !== ratchetPct.value || JSON.stringify(drops) !== JSON.stringify(shorts.value);
    if (!changed) return;
    sliderDates.value = dates;
    bitcoinCount.value = quantity;
    ratchetPct.value = threshold;
    shorts.value = drops;
    schedulePersist();
    runVault();
  }
  function addPriceDrop(date: unknown, price: unknown) {
    const short = validatePriceDrop(date, price, sliderDates.value, shorts.value, argonTarget.usdTargetForArgon, dateDomain);
    const next = [...shorts.value, short].sort((a, b) => a.date === 'EXIT' ? 1 : b.date === 'EXIT' ? -1 : a.date.localeCompare(b.date));
    commitScenario({ shorts: next });
  }
  function removePriceDrop(date: string) { commitScenario({ shorts: shorts.value.filter(short => short.date !== date) }); }
  // Retain the existing onboarding/config entry point without a second scenario write path.
  function setConfig(data: Record<string, any>) {
    if (data.tourStep !== undefined) tourStep.value = data.tourStep;
    if (data.completedWelcome !== undefined) completedWelcome.value = data.completedWelcome;
    const change: Partial<Scenario> = {};
    if (data.bitcoinCount !== undefined) change.bitcoinCount = data.bitcoinCount;
    if (data.ratchetPct !== undefined) change.ratchetPct = data.ratchetPct;
    if (data.sliderDates) change.sliderDates = { left: dateOnly(data.sliderDates.left), right: dateOnly(data.sliderDates.right) };
    if (data.shorts) change.shorts = data.shorts;
    if (Object.keys(change).length) commitScenario(change);
    persist();
  }
  function resetConfig() {
    if (persistFrame !== null) cancelAnimationFrame(persistFrame);
    persistFrame = null;
    sessionStorage.removeItem('config');
  }
  function downloadRawData() {
    if (!canExport.value) return;
    const snapshot = structuredClone(toRaw(vaultSnapshot.value));
    return new Download(snapshot).run();
  }
  const positionChecks: Record<string, () => DOMRect> = {};
  function registerPositionCheck(id: string, check: () => DOMRect) {
    positionChecks[id] = check;
    return () => { if (positionChecks[id] === check) delete positionChecks[id]; };
  }
  function getPositionCheck(id: string) {
    const rect = positionChecks[id]?.();
    return { left: rect?.left || 0, top: rect?.top || 0, right: rect?.right || 0, bottom: rect?.bottom || 0 };
  }
  async function loadData() {
    isLoaded.value = true;
    persist();
    runVault();
  }
  window.addEventListener('pagehide', flushPersist);
  onScopeDispose(() => {
    flushPersist();
    queue.dispose();
    window.removeEventListener('pagehide', flushPersist);
  });
  return {
    isLoaded, bitcoinPrices, bitcoinFees, dateDomain, tourStep, completedWelcome,
    bitcoinCount, ratchetPct, sliderDates, sliderIndexes, shorts, activeShorts, purchasePrice,
    vaultSnapshot, calculationState, calculationError, canExport,
    usdTargetForArgon: argonTarget.usdTargetForArgon, argonTargetUpdatedAt: argonTarget.lastUpdatedAt,
    commitScenario, addPriceDrop, removePriceDrop, setConfig, runVault, resetConfig,
    downloadRawData, registerPositionCheck, getPositionCheck, loadData,
  };
});
