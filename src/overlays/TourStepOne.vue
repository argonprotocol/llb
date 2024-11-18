<template>
  <div class="absolute z-[2001] w-full max-w-[30rem] -translate-x-full" :style="{ left: left, bottom: '3.4%' }">
    
    <div Arrow ref="arrowRef" class="absolute left-full top-1/2 translate-y-[50%] -translate-x-2 rotate-90 z-1">
      <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="white"/>
      </svg>
      <svg class="absolute z-0 -top-0.5 left-[-1.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="black"/>
      </svg>
    </div>

    <div ref="boxRef" class="flex flex-col shadow-lg bg-white border border-slate-500/60 rounded w-full px-4 font-light">
      <h3 class="text-lg font-bold py-4 mb-4 flex flex-row justify-between border-b border-slate-300/60">
        <div>Drag a Slider to Set Your Vault</div>
        <div class="text-slate-500/40">Step 1 of 4</div>
      </h3>

      <p>
        Drag the left slider to set your bitcoin's starting vault date. The right slider sets your exit date. Select any time range you desire, from yesterday the 
        11th of November all the way back to Bitcoin's first public trading date of October 1, 2010.
      </p>

      <div class="flex flex-row justify-end px-3 mt-3 pb-3 border-t border-slate-300/60 space-x-3">
        <button @click="cancelTour" type="button" class="rounded-md bg-[#E6EAF3] border border-[#969AA5] px-8 py-2 mt-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500">Cancel Tour</button>
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
import { storeToRefs } from 'pinia';
import emitter from '../emitters/basic';
import { useBasicStore } from '../store';

dayjs.extend(dayjsUtc);

const basicStore = useBasicStore();
const { tourStep, completedWelcome } = storeToRefs(basicStore);

const props = defineProps<{
  pos: { left: number, top: number, right: number, bottom: number };
}>();

const left = Vue.computed(() => (props.pos.left + 15) + 'px');

const emit = defineEmits(['nextStep']);

const nextStep = () => {
  emit('nextStep');
};

const cancelTour = () => {
  basicStore.setConfig({ tourStep: 0 });
  if (!completedWelcome.value) {
    emitter.emit('openWelcomeOverlay');
  }
};

</script>

<style lang="scss" scoped>
  
</style>