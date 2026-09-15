<template>
  <DesktopHeader v-if="desktop" />
  <MobileHeader v-else />
</template>
<script setup lang="ts">
import DesktopHeader from '../layouts/DesktopHeader.vue';
import MobileHeader from '../layouts/MobileHeader.vue';
import { useDesktopLayout } from '../lib/ResponsiveLayout';
const desktop = useDesktopLayout();
</script>
