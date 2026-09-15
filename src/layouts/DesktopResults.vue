<template>
  <section id="results" ref="sectionRef" tabindex="-1" aria-label="Simulation results" class="results-summary" :data-state="calculationState">
    <div class="results-caption">
      <template v-if="vaultSnapshot.inputs">
        <span class="caption-dates">Results from {{ dayjs.utc(vaultSnapshot.inputs.startingDate).format('MMMM D, YYYY') }} to {{ dayjs.utc(vaultSnapshot.inputs.endingDate).format('MMMM D, YYYY') }}</span>
        <span class="text-slate-400 sr-only"> · {{ vaultSnapshot.bitcoinCount }} BTC</span>
      </template>
      <template v-else>Calculating your scenario…</template>
    </div>
    <div class="result-metrics" :class="{ 'opacity-60': calculationState !== 'ready' }">
      <div class="metrics-main">
        <button v-for="stat in desktopStats" :key="stat.id" type="button" :class="['result-stat', stat.id]" :insightId="stat.id" :disabled="!vaultSnapshot.isLoaded"
          :aria-label="stat.label + ': ' + stat.value + '. Show explanation'" @click="show($event)" @mouseenter="hover" @mouseleave="hideInsight()">
          <span v-if="stat.id !== 'ratchets'" class="metric-operator" aria-hidden="true">{{ stat.id === 'shorts' ? '+' : '=' }}</span>
          <strong :class="stat.color">{{ stat.value }}</strong><span class="metric-label">{{ stat.label }}</span>
        </button>
      </div>
      <button v-for="stat in stats.filter(stat => stat.id === 'hodlerReturns')" :key="stat.id" type="button" :class="['result-stat', stat.id]" :insightId="stat.id" :disabled="!vaultSnapshot.isLoaded"
        :aria-label="stat.label + ': ' + stat.value + '. Show explanation'" @click="show($event)" @mouseenter="hover" @mouseleave="hideInsight()">
        <span class="metric-operator" aria-hidden="true">vs</span>
        <strong :class="stat.color">{{ stat.value }}</strong><span class="metric-label">{{ stat.label }}</span>
      </button>
    </div>
    <ResultStatus />
  </section>
</template>
<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue';
import dayjs from 'dayjs';
import { useSimulationResults } from '../lib/SimulationResults';
import ResultStatus from '../components/ResultStatus.vue';
const { store, vaultSnapshot, calculationState, stats, show, hover, hideInsight } = useSimulationResults();
const sectionRef = ref<HTMLElement | null>(null);
onScopeDispose(store.registerPositionCheck('scoreboard', () => sectionRef.value?.getBoundingClientRect() || new DOMRect()));
const desktopStats = computed(() => ['ratchets', 'shorts', 'cashUnlocked', 'vaulterReturns'].map(id => stats.value.find(stat => stat.id === id)!));
</script>
<style scoped>
.results-summary { min-width: 0; }
.results-caption { color: #64748b; text-align: center; }
.result-stat { min-width: 0; }
.result-stat strong { display: block; overflow-wrap: anywhere; }
.result-stat span { display: block; }
.result-stat:hover { background: white; }
.results-summary { container-type: normal; color: black; }
.results-caption { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; height: 56px; padding: 0 .75rem; font-size: 1rem; white-space: nowrap; text-transform: uppercase; }
.results-caption::before { content: ''; position: absolute; inset: auto -1rem -1rem; height: 4rem; background: linear-gradient(to bottom, #e6eaf3 30%, rgba(248,250,255,0)); }
.caption-dates { position: relative; top: 4px; }
.results-caption::after { content: ''; position: absolute; bottom: 0; left: 8px; right: 8px; height: 1px; background: linear-gradient(to right, #94a3b833 calc(80% - 8px), transparent calc(80% - 8px), transparent calc(80% + 8px), #94a3b833 calc(80% + 8px)); }
.result-metrics { display: flex; justify-content: space-between; gap: 4px; }
.metrics-main { display: flex; position: relative; min-width: 80%; padding: 4px 0; }
.metrics-main::before, .hodlerReturns::before { content: ''; position: absolute; inset: -48px 0 0; z-index: -1; background: #f8faff; border: 1px solid #1e293b33; border-radius: 4px; box-shadow: 0 1px 3px #0003, 0 1px 2px #0002; }
.result-stat { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: transparent; border: 0; border-radius: 0; padding: 8px 4px; white-space: nowrap; }
.result-stat strong { font-size: 20px; line-height: 28px; }
.result-stat .metric-label { color: #64748bb3; font-size: 16px; line-height: 24px; text-transform: capitalize; }
.ratchets { order: 1; min-width: 20%; padding: 8px 40px; }
.shorts { order: 2; min-width: 20%; padding: 8px 40px; border-left: 1px solid #47556933; }
.cashUnlocked { order: 3; min-width: 30%; border-left: 1px solid #47556933; }
.vaulterReturns { order: 4; min-width: 30%; border-left: 1px solid #47556933; }
.hodlerReturns { min-width: 20%; margin: 4px 0; padding: 8px 0; }
.hodlerReturns::before { top: -52px; bottom: -4px; }
.result-stat .metric-operator { display: block; position: absolute; left: -1px; top: 8px; transform: translateX(-50%); background: #f8faff; color: black; font-size: 20px; line-height: 28px; font-weight: 700; pointer-events: none; }
.hodlerReturns .metric-operator { top: 12px; left: -2px; border: 1px solid #94a3b866; border-radius: 4px; padding: 0 8px; font-size: 16px; line-height: 24px; z-index: 1; }
:deep(.result-status) { position: relative; min-height: 0; }
</style>
