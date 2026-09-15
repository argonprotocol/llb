<template>
  <div class="activity-content">
    <p v-if="!snapshot.isLoaded" class="p-4 text-slate-500">Calculating activity…</p>
    <template v-else>
      <p class="p-3 text-xs text-slate-500">Activity for {{ snapshot.inputs?.startingDate }} to {{ snapshot.inputs?.endingDate }} · {{ snapshot.bitcoinCount }} BTC <span v-if="store.calculationState !== 'ready'">· Updating</span></p>
      <div class="activity-rows">
        <details v-for="(action, index) in visibleActions" :key="index" class="activity-row">
          <summary><span>{{ dayjs.utc(action.date).format('MMM D, YYYY') }} · {{ formatLabel(action.type) }}</span><strong>Cash change: ${{ currency(action.cashChange || 0) }}</strong></summary>
          <dl><template v-for="field in fields(action)" :key="field.label"><dt>{{ field.label }}</dt><dd>${{ currency(field.value) }}</dd></template></dl>
        </details>
      </div>
      <button v-if="visibleCount < snapshot.actions.length" type="button" class="secondary-button m-3" @click="visibleCount += 25">Show more ({{ snapshot.actions.length - visibleCount }} remaining)</button>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { useBasicStore } from '../store';
import { currency } from '../lib/BasicUtils';
import type { IAction, IActionType } from '../lib/Vault';
const store = useBasicStore();
const snapshot = computed(() => store.vaultSnapshot);
const visibleCount = ref(25);
const visibleActions = computed(() => snapshot.value.actions.slice(0, visibleCount.value));
watch(snapshot, () => { visibleCount.value = 25; });
function formatLabel(type: IActionType) {
  return { 'enter-vault': 'Enter vault', 'exit-vault': 'Exit vault', 'ratchet-up': 'Ratchet up', 'ratchet-down': 'Ratchet down', short: 'Cover short' }[type] || type;
}
function fields(action: IAction) {
  return [{ label: 'BTC price', value: action.price }, { label: 'Fees', value: action.fees || 0 }, { label: 'Accrued cash', value: action.totalCashUnlocked }, { label: 'Accrued value', value: action.totalAccruedValue }];
}
</script>
<style scoped>
.activity-row { background: #f8faff; border-bottom: 1px solid #cbd5e1; }
.activity-row summary { padding: .8rem; cursor: pointer; }
.activity-row strong { display: block; font-size: .8rem; color: #64748b; font-weight: normal; margin-top: .2rem; }
dl { display: grid; grid-template-columns: 1fr 1fr; gap: .4rem; padding: .4rem .8rem .8rem; font-size: .85rem; }
dd { text-align: right; overflow-wrap: anywhere; }
</style>
