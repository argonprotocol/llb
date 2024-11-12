<template>
  <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
    <PopoverPanel :style="{ bottom: calculateBottom() }" class="absolute left-0 z-[1000] flex w-screen max-w-max">
      <div :style="{ left: '70px', bottom: '1px', rotate: '180deg' }" class="absolute -translate-x-1/2 -translate-y-full">
        <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L24 12H0L12 0Z" fill="white"/>
        </svg>
        <svg class="absolute z-0 -top-0.5 left-[-0.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L24 12H0L12 0Z" fill="black"/>
        </svg>
      </div>
      <div ref="boxRef" :style="{ maxHeight: calculateMaxHeight(), minHeight: '280px' }" class="flex flex-col shadow bg-white border border-slate-400/60 rounded h-full pb-1">
        <div class="overflow-x-visible overflow-y-scroll">
          <table class="cursor-default select-none overflow-hidden rounded-t-lg">
            <thead class="sticky top-0 bg-white">
              <tr>
                <th class="text-left"><div>Date</div></th>
                <th class="text-left"><div>Action</div></th>
                <th class="text-left"><div>BTC Price</div></th>
                <th class="text-left"><div>Fees</div></th>
                <th class="text-left"><div>Cash Change</div></th>
                <th class="text-right"><div>Cash Unlocked</div></th>
                <th class="text-right"><div>Accrued Value</div></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(action, index) in actions" :key="index" class="hover:bg-slate-100" @mouseenter="highlight(index, action)" @mouseleave="unhighlight(index, action)">
                <td><div>{{ dayjs.utc(action.date).format('MMMM D, YYYY') }}</div></td>
                <td><div>{{ formatLabel(action.type) }}</div></td>
                <td><div>${{ addCommas(formatPrice(action.price, 0)) }}</div></td>
                <td><div>
                  <span v-if="action.btcTransactionFee">${{ addCommas(formatPrice(action.btcTransactionFee + action.securityFee, 2)) }}</span>
                </div></td>
                <td><div>
                  <span v-if="action.cashChange">{{ action.cashChange < 0 ? '-' : '+' }}${{ addCommas(Math.abs(action.cashChange).toFixed(0)) }}</span>
                </div></td>
                <td class="text-right"><div>${{ addCommas(formatPrice(action.totalCashUnlocked, 0)) }}</div></td>
                <td class="text-right"><div>${{ addCommas(formatPrice(action.totalAccruedValue, 0)) }}</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PopoverPanel>
  </transition>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { IAction, IActionType } from '../lib/Vault';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { addCommas, formatPrice } from '../lib/BasicUtils';
import { PopoverPanel } from '@headlessui/vue';
import emitter from '../emitters/basic';

dayjs.extend(utc);


const props = defineProps<{
  buttonSpacing: { buttonHeight: number, spaceAboveButton: number };
  actions: IAction[];
}>();

const actions = Vue.computed(() => props.actions);

function calculateBottom() {
  const bottom = props.buttonSpacing.buttonHeight + 5;
  return `${bottom}px`;
}

function calculateMaxHeight() {
  const height = props.buttonSpacing.spaceAboveButton - 25;
  return `${height}px`;
}

function highlight(index: number, action: IAction) {
  if (index === 0) {
    emitter.emit('highlight', { isStart: true });
  } else if (index === props.actions.length - 1) {
    emitter.emit('highlight', { isEnd: true });
  } else {
    emitter.emit('highlight', { isRatchet: true, date: action.date });
  }
}

function unhighlight(index: number, action: IAction) {
  if (index === 0) {
    emitter.emit('unhighlight', { isStart: true });
  } else if (index === props.actions.length - 1) {
    emitter.emit('unhighlight', { isEnd: true });
  } else {
    emitter.emit('unhighlight', { isRatchet: true, date: action.date });
  }
}

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

</script>

<style lang="scss" scoped>
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