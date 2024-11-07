<template>
  <div class="flex flex-row min-h-screen w-screen">
    <div class="flex flex-col h-screen grow min-w-[60rem]">
      <Header />
      <Main v-if="isLoaded" class="grow" />
      <Loading v-else class="grow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBasicStore } from './store';
import Header from './components/Header.vue';
import Loading from './view-panels/Loading.vue';
import Main from './view-panels/Main.vue';
import { storeToRefs } from 'pinia';

const basicStore = useBasicStore();
const { loadData } = basicStore;
const { isLoaded } = storeToRefs(basicStore);

loadData();
</script>
