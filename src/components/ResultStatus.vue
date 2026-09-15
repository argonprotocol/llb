<template>
  <div class="result-status" :aria-live="announce ? 'polite' : undefined" aria-atomic="true">
    <span v-if="store.calculationState === 'pending'">Recalculating Results</span>
    <template v-else-if="store.calculationState === 'error'">{{ store.calculationError }} <button type="button" class="text-fuchsia-700 underline" @click="store.runVault()">Retry calculation</button></template>
    <span v-else-if="announce && store.calculationState === 'ready'" class="sr-only">Results updated.</span>
  </div>
</template>
<script setup lang="ts">
import { useBasicStore } from '../store';
withDefaults(defineProps<{ announce?: boolean }>(), { announce: true });
const store = useBasicStore();
</script>
<style scoped>
.result-status { color: #64748b; text-align: center; font-size: .8rem; min-height: 1rem; }
</style>
