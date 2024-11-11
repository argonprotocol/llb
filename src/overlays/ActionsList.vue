<template>
  <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
    <PopoverPanel :style="{ top: calculateTop(), height: calculateHeight() }" class="absolute left-0 z-[1000] flex w-screen max-w-max">
      <div :style="{ left: '70px', bottom: '1px', rotate: '180deg' }" class="absolute -translate-x-1/2 -translate-y-full">
        <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L24 12H0L12 0Z" fill="white"/>
        </svg>
        <svg class="absolute z-0 -top-0.5 left-[-0.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L24 12H0L12 0Z" fill="black"/>
        </svg>
      </div>
      <div ref="boxRef" class="flex flex-col shadow bg-white border border-slate-400/60 rounded h-full pb-1">
        <div class="overflow-x-visible overflow-y-scroll">
          <table class="cursor-default select-none overflow-hidden rounded-t-lg">
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
  <!-- </div> -->
    </PopoverPanel>
  </transition>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { IAction, IActionType } from '../lib/Vault';
import emitter from '../emitters/basic';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { addCommas, formatPrice } from '../lib/BasicUtils';
import { PopoverPanel } from '@headlessui/vue'
dayjs.extend(utc);


const props = defineProps<{
  spaceAboveButton: number;
  actions: IAction[];
}>();

const isOpen = Vue.ref(false);
const actions = Vue.computed(() => props.actions);

function calculateTop() {
  const top = props.spaceAboveButton - 20;
  return `-${top}px`;
}

function calculateHeight() {
  const height = props.spaceAboveButton - 25;
  return `${height}px`;
}

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
  console.log('bottomFromTop', data.bottomFromTop);
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