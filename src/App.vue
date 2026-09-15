<template>
  <div class="app-shell">
    <Header />
    <Main v-if="isLoaded" />
    <Loading v-else class="min-h-[20rem]" />
    <Tour v-if="isLoaded && tourStep > 0 && desktop" />
    <WelcomeOverlay />
    <InsightOverlay />
    <TooltipOverlay />
    <VideoOverlay />
    <WhitepapersOverlay />
    <FaqOverlay />
    <DetailsOfLiquidLocking />
    <ConfirmConfigReset />
    <ConfirmShortRemoval />
    <AddShort />
    <ScenarioEditorDialog />
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
import ConfirmConfigReset from './overlays/ConfirmConfigReset.vue';
import Tour from './panels/Tour.vue';
import emitter from './emitters/basic';
import { useDesktopLayout } from './lib/ResponsiveLayout';
import ConfirmShortRemoval from './overlays/ConfirmShortRemoval.vue';
import AddShort from './overlays/AddShort.vue';
import ScenarioEditorDialog from './components/ScenarioEditorDialog.vue';

const basicStore = useBasicStore();
const { isLoaded, tourStep, completedWelcome } = storeToRefs(basicStore);

const desktop = useDesktopLayout();
Vue.onMounted(async () => {
  await basicStore.loadData();
  await Vue.nextTick();
  if (!completedWelcome.value && tourStep.value === 0) emitter.emit('openWelcomeOverlay');
});
</script>
