<template>
  <div class="absolute z-[2000] w-full max-w-[48rem]" :style="{ left: left, top: '20%' }">
    
    <div Arrow ref="arrowRef" class="absolute left-0 top-[23%] translate-y-[50%] -translate-x-4 -rotate-90 z-1">
      <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="white"/>
      </svg>
      <svg class="absolute z-0 -top-0.5 left-[-1.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="black"/>
      </svg>
    </div>

    <div ref="boxRef" class="flex flex-col shadow-lg bg-white border border-slate-500/60 rounded w-full px-6 font-light">
      <h3 class="text-lg font-bold py-4 mb-4 flex flex-row justify-between border-b border-slate-300/60">
        <div>Ratchet or Death Spiral</div>
        <div class="text-slate-500/40">Step 2 of 4</div>
      </h3>

      <div class="flex flex-col space-y-3">
        <p>The profit outcome of Liquid Locking is largely driven by three core properties. All three are configurable from this panel:</p>
        <p><strong>The date your bitcoin enters and exits the vault</strong>. The greater the pricing volatility of Bitcoin, the greater your profits. You can directly set the date range here or use the sliders as shown in the previous step.</p>
        <p><strong>The price change required to trigger a Ratchet</strong>. Ratchets are another key driver of vaulting profits. Your bitcoin is only ratcheted when its price rises or falls more than the percentage shown. You can completely disable Ratcheting by setting this to 0%.</p>
        <p><strong>The collapse of Argon</strong>. Add or remove Argon price drops to see how your vaulted bitcoin can profit if Argon ever drops in price or collapses into a death spiral.</p>
        <p>As you explore these settings, you'll find it's impossible for vaulting returns to be worse than hodler returns. In almost every scenario, vaulting is substantially better.</p>
      </div>

      <div class="flex flex-row justify-start px-3 mt-3 pb-3 border-t border-slate-300/60 space-x-3">
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

const left = Vue.computed(() => (props.pos.right + 5) + 'px');

const previousStep = () => {
  emit('previousStep');
};

const nextStep = () => {
  emit('nextStep');
};

</script>

<style lang="scss" scoped>
  strong {
    font-weight: bold;
  }
</style>