<template>
  <div v-if="isOpen" class="absolute z-[2000]" :style="`left: ${config.left}px; top: ${config.top}px; height: ${config.height}px; opacity: ${config.opacity}`">
    <div ref="boxRef" class="flex flex-col shadow-lg bg-white border border-slate-400/60 rounded-lg overflow-x-visible overflow-y-scroll h-full pb-3">
      <table class="cursor-default select-none">
        <thead class="sticky top-0 bg-white">
          <tr>
            <th class="text-left">Date</th>
            <th class="text-left">Action</th>
            <th class="text-right">BTC Price</th>
            <th class="text-right">Liquid Cash Adj.</th>
            <th class="text-right">Total Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="action in actions" :key="action.date" class="hover:bg-slate-100">
            <td>{{ dayjs.utc(action.date).format('MMMM D, YYYY') }}</td>
            <td>{{ formatLabel(action.type) }}</td>
            <td>${{ addCommas(formatPrice(action.price, 0)) }}</td>
            <td><span v-if="action.liquidCash">{{ action.liquidCash < 0 ? '-' : '+' }}${{ addCommas(Math.abs(action.liquidCash).toFixed(0)) }}</span></td>
            <td>${{ addCommas(formatPrice(action.aggregatedLiquidCash, 0)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { IAction, IActionType } from '../lib/Vault';
import emitter from '../emitters/basic';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { addCommas, formatPrice } from '../lib/BasicUtils';

dayjs.extend(utc);

const isOpen = Vue.ref(false);
const actions = Vue.ref<IAction[]>([]);

const config = Vue.ref({
  left: 0,
  top: 0,
  height: 0,
  opacity: 0,
});

function formatLabel(type: IActionType): string {
  if (type === 'enter-vault') {
    return 'Enter Vault';
  } else if (type === 'exit-vault') {
    return 'Exit Vault';
  } else if (type === 'ratchet-up') {
    return 'Ratchet Up';
  } else if (type === 'ratchet-down') {
    return 'Ratchet Down';
  } else if (type === 'short') {
    return 'Cover Short';
  }
}

emitter.on('showActionsList', (data:{ actions:  IAction[], left: number, bottomFromTop: number }) => {
  isOpen.value = true;
  actions.value = data.actions;
  config.value.left = data.left;
  config.value.top = 20;
  config.value.height = data.bottomFromTop - (config.value.top + 5);
  config.value.opacity = 1;
});

emitter.on('hideActionsList', () => {
  isOpen.value = false;
});

</script>

<style lang="scss" scoped>
table {
  width: 100%;

  th {
    padding-top: 10px;
    padding-bottom: 5px;
  }
  
  td, th {
    padding-right: 10px;
    padding-left: 10px;
    border-right: 1px solid #e5e7eb;
    &:first-child {
      padding-left: 20px;
    }
    &:last-child {
      padding-right: 20px;
      border-right: none;
    }
  }
}
</style>