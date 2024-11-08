<template>
  <div class="flex flex-row min-h-screen w-screen select-none">
    <div class="flex flex-col h-screen grow min-w-[60rem]">
      <Header />
      <Main v-if="isLoaded" class="grow" />
      <Loading v-else class="grow" />
    </div>
    <WelcomeOverlay />
    <TheKeyOverlay />
    <ActionsList />
  </div>
</template>

<script setup lang="ts">
import { useBasicStore } from './store';
import Header from './components/Header.vue';
import Loading from './view-panels/Loading.vue';
import Main from './view-panels/Main.vue';
import { storeToRefs } from 'pinia';
import WelcomeOverlay from './overlays/WelcomeOverlay.vue';
import ActionsList from './overlays/ActionsList.vue';
import TheKeyOverlay from './overlays/TheKeyOverlay.vue';

const basicStore = useBasicStore();
const { loadData } = basicStore;
const { isLoaded } = storeToRefs(basicStore);

loadData();
</script>
