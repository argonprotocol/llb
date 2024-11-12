<template>
  <div v-if="isTooNarrow" class="flex flex-col h-screen w-screen select-none justify-center">
    <div class="text-center text-slate-400/80 text-xl pt-4 font-bold" style="text-shadow: 1px 1px 0 rgba(255,255,255,0.8);">
      This tool is best viewed on a larger screen.
    </div>
  </div>
  <div v-else class="flex flex-row min-h-screen w-screen select-none">
    <div class="flex flex-col h-screen grow min-w-[60rem]">
      <Header />
      <Main v-if="isLoaded" class="grow" />
      <Loading v-else class="grow" />
    </div>
    <WelcomeOverlay />
    <TheKeyOverlay />
    <Insight />
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
import TheKeyOverlay from './overlays/TheKeyOverlay.vue';
import Insight from './overlays/Insight.vue';

const basicStore = useBasicStore();
const { loadData } = basicStore;
const { isLoaded } = storeToRefs(basicStore);

const windowWidth = Vue.ref(window.innerWidth);
Vue.onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
});

const isTooNarrow = Vue.computed(() => windowWidth.value < 1024);

loadData();
</script>
