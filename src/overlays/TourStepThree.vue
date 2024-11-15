<template>
  <div class="absolute z-[2000]" :style="{ left, top, width }">
    
    <div Arrow ref="arrowRef" class="absolute left-1/2 top-[1px] translate-x-[50%] -translate-y-full z-1">
      <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="white"/>
      </svg>
      <svg class="absolute z-0 -top-0.5 left-[-1.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="black"/>
      </svg>
    </div>

    <div ref="boxRef" class="flex flex-col shadow-lg bg-white border border-slate-500/60 rounded w-full px-6 font-light">
      <h3 class="text-lg font-bold py-4 mb-4 flex flex-row justify-between border-b border-slate-300/60">
        <div>Time Travel Your Profits</div>
        <div class="text-slate-500/40">Step 3 of 4</div>
      </h3>

      <div class="flex flex-col space-y-3">
        <p>This is your results scoreboard. It allows you to test multilple trading scenarios across every possible timeframe over the last fifteen years, and it does so using the same algorithms that are found in Argon's actual codebase.  It's like vaulting your bitcoin on the Argon mainnet without waiting fifteen years to see what happens.</p>
        <p>Note: move your mouse over any stat on the scoreboard to explore more detail.</p>
      </div>

      <div class="flex flex-row justify-center px-3 mt-3 pb-3 border-t border-slate-300/60 space-x-3">
        <button @click="previousStep" type="button" class="rounded-md bg-[#E6EAF3] border border-[#969AA5] px-8 py-2 mt-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500">Previous Step</button>
        <button @click="nextStep" class="rounded-md cursor-pointer border px-8 py-2 mt-4 text-sm font-semibold shadow-sm text-white border-fuchsia-800 bg-fuchsia-600 hover:bg-fuchsia-500 hover:border-fuchsia-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500">
          Next Step
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

const top = Vue.computed(() => (props.pos.bottom +5) + 'px');
const left = Vue.computed(() => (props.pos.left + 25) + 'px');
const width = Vue.computed(() => (props.pos.right - props.pos.left) - 50 + 'px');

const previousStep = () => {
  emit('previousStep');
};

const nextStep = () => {
  emit('nextStep');
};

</script>

<style lang="scss" scoped>
  
</style>