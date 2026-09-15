<template>
  <Popover class="relative MoreInfoMenu" v-slot="{ close }">
    <PopoverButton class="menu-trigger touch-button border-0 bg-transparent text-[#86198f]" aria-label="Open actions and help"><Bars3Icon class="w-5 h-5" aria-hidden="true" /></PopoverButton>
    <PopoverPanel class="actions-menu absolute right-0 mt-2 z-[3100] rounded-lg bg-white shadow-lg border border-slate-300 p-1">
      <button v-for="item in items" :key="item.label" type="button" @click="open(item.event, close)">{{ item.label }}</button>
      <button type="button" :disabled="!store.canExport" @click="download(close)">Download raw data</button>
      <button type="button" @click="open('openConfirmConfigReset', close)">Reset to defaults</button>
      <a href="https://github.com/argonprotocol/llb" target="_blank" rel="noopener noreferrer">View source code</a>
      <a href="https://argon.network">Visit Argon Network</a>
    </PopoverPanel>
  </Popover>
</template>
<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { Bars3Icon } from '@heroicons/vue/24/outline';
import { useBasicStore } from '../store';
import emitter from '../emitters/basic';
const store = useBasicStore();
const items = [
  { label: 'Details of Liquid Locking', event: 'openDetailsOfLiquidLocking' },
  { label: 'Frequently asked questions', event: 'openFaqOverlay' },
  { label: 'Read our whitepapers', event: 'openWhitepapersOverlay' },
  { label: 'Watch Liquid Locking 101', event: 'openVideoOverlay' },
];
function open(event: string, close: () => void) { close(); emitter.emit(event); }
function download(close: () => void) { close(); store.downloadRawData(); }
</script>
<style>
.actions-menu { width: min(20rem, calc(100vw - 2rem)); max-height: 80dvh; overflow-y: auto; }
.actions-menu button, .actions-menu a { display: block; width: 100%; text-align: left; padding: .65rem .8rem; min-height: 44px; color: #475569; border-radius: .3rem; }
.actions-menu button:hover, .actions-menu a:hover { background: #faf4fc; color: #86198f; }
</style>
