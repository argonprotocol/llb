<template>
  <div class="desktop-activity-control">
    <button ref="button" type="button" class="secondary-button activity-trigger" :aria-expanded="open" aria-haspopup="dialog" aria-controls="desktop-vault-activity" @click="toggle">Show Vault Activity</button>
    <DesktopPopover :open="open" :anchor="anchor" id="desktop-vault-activity" label="Vault activity" placement="top-start" width="max-content" :gap="5" :arrow-offset="70" fit-above focus-on-open @close="close">
      <div class="activity-table">
        <p v-if="!snapshot.isLoaded" class="p-4 text-sm text-slate-500">Calculating activity…</p>
        <template v-else>
          <p v-if="store.calculationState !== 'ready'" role="status" class="p-2 text-xs text-slate-500">Updating · showing the completed scenario from {{ snapshot.inputs?.startingDate }} to {{ snapshot.inputs?.endingDate }}</p>
          <table class="cursor-default select-none overflow-hidden rounded-t-lg">
  <thead class="sticky top-0 bg-white">
    <tr>
      <th class="text-left"><div>Date</div></th>
      <th class="text-left"><div>Action</div></th>
      <th class="text-left"><div>BTC Price</div></th>
      <th class="text-left"><div>Fees</div></th>
      <th class="text-left"><div>Cash Change</div></th>
      <th class="text-right"><div>Accrued Cash</div></th>
      <th class="text-right"><div>Accrued Value</div></th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(action, index) in snapshot.actions" :key="index" class="hover:bg-slate-100" @mouseenter="highlight(index, action)" @mouseleave="emitter.emit('unhighlight')">
      <td><div>{{ dayjs.utc(action.date).format('MMM D, YYYY') }}</div></td>
      <td><div>{{ formatLabel(action.type) }}</div></td>
      <td><div>${{ addCommas(formatPrice(action.price, 0)) }}</div></td>
      <td><div>
        <span v-if="action.fees">${{ addCommas(formatPrice(action.fees, 2)) }}</span>
      </div></td>
      <td><div>
        <span v-if="action.cashChange">{{ action.cashChange < 0 ? '-' : '+' }}${{ addCommas(Math.abs(action.cashChange).toFixed(0)) }}</span>
      </div></td>
      <td class="text-right"><div>${{ addCommas(formatPrice(action.totalCashUnlocked, 0)) }}</div></td>
      <td class="text-right"><div>${{ addCommas(formatPrice(action.totalAccruedValue, 0)) }}</div></td>
    </tr>
  </tbody>
</table>
        </template>
      </div>
    </DesktopPopover>
  </div>
</template>
<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue';
import dayjs from 'dayjs';
import DesktopPopover from '../components/DesktopPopover.vue';
import { useBasicStore } from '../store';
import { addCommas, formatPrice } from '../lib/BasicUtils';
import { hideInsight } from '../lib/InsightUtils';
import type { IAction, IActionType } from '../lib/Vault';
import emitter from '../emitters/basic';
const store = useBasicStore();
const snapshot = computed(() => store.vaultSnapshot);
const open = ref(false);
const button = ref<HTMLButtonElement | null>(null);
const anchor = () => button.value;
function toggle() { hideInsight(true); open.value = !open.value; }
function close() { open.value = false; emitter.emit('unhighlight'); }
function highlight(index: number, action: IAction) {
  emitter.emit('highlight', { isStart: index === 0, isEnd: index === snapshot.value.actions.length - 1, date: action.date });
}
function formatLabel(type: IActionType) {
  return { 'enter-vault': 'Enter Vault', 'exit-vault': 'Exit Vault', 'ratchet-up': 'Ratchet Up', 'ratchet-down': 'Ratchet Down', short: 'Cover Short' }[type] || type;
}
onScopeDispose(() => emitter.emit('unhighlight'));
</script>
<style lang="scss" scoped>
.activity-trigger { min-height: 0; border-color: #94a3b8; color: #a21caf; padding: 6px 24px; font-size: 16px; line-height: 24px; border-radius: 6px; background: #ffffff80; }
.activity-trigger:hover { background: white; }
.activity-table { color: black; font-size: 16px; line-height: 24px; white-space: nowrap; border: 1px solid #94a3b899; border-radius: 4px; padding-bottom: 4px; }

table {
  width: 100%;

  tr {
    border-bottom: 1px solid #e5e7eb;
    &:last-child {
      border-bottom: none;
    }
  }
  
  td, th {
    & > div {
      min-height: 1.5rem;
      padding-right: 10px;
      padding-left: 10px;
      border-right: 1px solid #d1d5dd;
    }
    &:first-child > div {
      padding-left: 20px;
    }
    &:last-child > div {
      padding-right: 20px;
      border-right: none;
    }
  }

  th {
    padding-top: 10px;
    padding-bottom: 5px;
    & > div {
      border-right: 1px solid #a3a8b2;
    }
  }
}

</style>
