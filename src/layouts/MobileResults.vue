<template>
  <section :id="compact ? undefined : 'results'" tabindex="-1" :aria-label="compact ? 'Updated results' : 'Simulation results'" class="results-summary" :class="{ compact }" :data-state="calculationState">
    <div class="result-metrics" :class="{ 'opacity-60': calculationState !== 'ready' }">
      <button v-for="stat in displayedStats" :key="stat.id" type="button" :class="['result-stat', stat.id]" :insightId="stat.id" :disabled="!vaultSnapshot.isLoaded"
        :aria-label="stat.label + ': ' + stat.value + '. Show explanation'" @click="show($event)">
        <strong :class="stat.color">{{ stat.value }}</strong><span>{{ stat.label }}</span>
      </button>
    </div>
    <ResultStatus :announce="!compact" />
    <button v-if="compact" type="button" class="secondary-button mt-2 w-full" @click="scrollToSection('results')">View full results</button>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useSimulationResults } from '../lib/SimulationResults';
import { scrollToSection } from '../lib/ResponsiveLayout';
import ResultStatus from '../components/ResultStatus.vue';
const props = defineProps<{ compact?: boolean }>();
const { vaultSnapshot, calculationState, stats, show } = useSimulationResults();
const displayedStats = computed(() => props.compact ? stats.value.slice(0, 2) : [...stats.value.slice(2), ...stats.value.slice(0, 2)]);
</script>
<style scoped>
.results-summary { position: relative; min-width: 0; container-type: inline-size; }
.results-summary:not([data-state="error"]) :deep(.result-status) { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; min-height: 0; pointer-events: none; }
.results-summary[data-state="pending"] :deep(.result-status) { padding: .1rem .8rem; border: 1px solid #b9bcc4; border-radius: .3rem; background: white; color: #737373; text-transform: uppercase; white-space: nowrap; }
.result-metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .4rem; }
.result-stat { background: #f8faff; border: 1px solid #cbd0d9; border-radius: .4rem; padding: .6rem .25rem; grid-column: span 2; min-width: 0; }
.result-stat strong { display: block; font-size: 1.3rem; overflow-wrap: anywhere; }
.result-stat span { display: block; color: #64748b; font-size: .78rem; }
.vaulterReturns, .hodlerReturns { grid-column: span 3; }
.result-stat:hover { background: white; }
@media (max-width: 350px) { .result-stat strong { font-size: 1.1rem; } }
@container (max-width: 16em) {
  .result-metrics { grid-template-columns: minmax(0, 1fr); }
  .result-stat, .vaulterReturns, .hodlerReturns { grid-column: 1; grid-row: auto; }
}

</style>
