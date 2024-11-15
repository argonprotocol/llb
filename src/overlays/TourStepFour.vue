<template>
  <div class="absolute z-[2000] w-[30rem] -translate-x-full" :style="{ left, top }">
    
    <div Arrow ref="arrowRef" class="absolute left-full top-[1px] -translate-x-[160%] -translate-y-full z-1">
      <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="white"/>
      </svg>
      <svg class="absolute z-0 -top-0.5 left-[-1.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="black"/>
      </svg>
    </div>

    <div ref="boxRef" class="flex flex-col shadow-lg bg-white border border-slate-500/60 rounded w-full px-6 font-light">
      <h3 class="text-lg font-bold py-4 mb-4 flex flex-row justify-between border-b border-slate-300/60">
        <div>Going Deep</div>
        <div class="text-slate-500/40">Step 4 of 4</div>
      </h3>

      <div class="flex flex-col space-y-3">
        <p>
          Click this icon to explore our frequently asked questions, learn more about Liquid Locking, or read our whitepapers on the state of 
          collateral-backed stablecoins and the novel mechanism that underpin Argon's stability.
        </p>
      </div>

      <div class="flex flex-row justify-end px-3 mt-3 pb-3 border-t border-slate-300/60 space-x-3">
        <button @click="previousStep" type="button" class="rounded-md bg-[#E6EAF3] border border-[#969AA5] px-8 py-2 mt-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500">Previous Step</button>
        <button @click="finishTour" class="rounded-md cursor-pointer border px-8 py-2 mt-4 text-sm font-semibold shadow-sm text-white border-fuchsia-800 bg-fuchsia-600 hover:bg-fuchsia-500 hover:border-fuchsia-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500">
          Finish Tour
        </button>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';

dayjs.extend(dayjsUtc);

const props = defineProps<{
  pos: { left: number, top: number, right: number, bottom: number };
}>();

const emit = defineEmits(['nextStep', 'previousStep']);

const top = Vue.computed(() => (props.pos.bottom + 10) + 'px');
const left = Vue.computed(() => (props.pos.left + 50) + 'px');

const previousStep = () => {
  emit('previousStep');
};

const finishTour = () => {
  emit('nextStep');
};

</script>

<style lang="scss" scoped>
  
</style>