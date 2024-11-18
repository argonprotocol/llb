<template>
  <div v-if="isTooNarrow" class="flex flex-col h-screen w-screen select-none justify-center px-20">
    <div class="text-center text-slate-400/80 text-xl pt-4 font-bold" style="text-shadow: 1px 1px 0 rgba(255,255,255,0.8);">
      This tool is best viewed on a larger screen. Please use a desktop or laptop.
    </div>
  </div>
  <div v-else class="flex flex-row min-h-screen w-screen select-none">
    <Tour v-if="isLoaded && tourStep > 0" />
    <div class="flex flex-col h-screen grow min-w-[60rem]">
      <Header />
      <Main v-if="isLoaded" class="grow" />
      <Loading v-else class="grow" />
    </div>
    <WelcomeOverlay />
    <InsightOverlay />
    <TooltipOverlay />
    <VideoOverlay />
    <WhitepapersOverlay />
    <FaqOverlay />
    <DetailsOfLiquidLocking />
    <ConfirmConfigReset />
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { useBasicStore } from './store';
import Header from './components/Header.vue';
import Loading from './panels/Loading.vue';
import Main from './panels/Main.vue';
import { storeToRefs } from 'pinia';
import WelcomeOverlay from './overlays/WelcomeOverlay.vue';
import InsightOverlay from './overlays/InsightOverlay.vue';
import TooltipOverlay from './overlays/TooltipOverlay.vue';
import VideoOverlay from './overlays/VideoOverlay.vue';
import WhitepapersOverlay from './overlays/WhitepapersOverlay.vue';
import FaqOverlay from './overlays/FaqOverlay.vue';
import DetailsOfLiquidLocking from './overlays/DetailsOfLiquidLocking.vue';
import Tour from './panels/Tour.vue';
import ConfirmConfigReset from './overlays/ConfirmConfigReset.vue';
import emitter from './emitters/basic';

const basicStore = useBasicStore();
const { loadData } = basicStore;
const { isLoaded, tourStep, completedWelcome } = storeToRefs(basicStore);

const windowWidth = Vue.ref(window.innerWidth);

Vue.onMounted(() => {
  if (!completedWelcome.value && tourStep.value === 0) {
    emitter.emit('openWelcomeOverlay');
  }

  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
});

const isTooNarrow = Vue.computed(() => windowWidth.value < 1224);

loadData();
</script>
