<template>
  <div class="flex flex-col h-screen grow min-w-[60rem]">
    <Header />
    <Runner v-if="selectedPanel === 'runner'" class="grow" />
    <Base v-if="selectedPanel === 'base'" class="grow" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Header from '../components/Header.vue';
import Runner from '../view-panels/Runner.vue';
import Base from '../view-panels/Base.vue';
import { useBasicStore } from '../stores/basic';

const basicStore = useBasicStore();
const { selectedPanel } = storeToRefs(basicStore);
</script>
