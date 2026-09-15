<template>
  <header class="app-header">
    <div class="branding">
      <span class="inline-flex items-center gap-1 shrink-0 text-[#73179e]">
        <a href="https://argon.network/" aria-label="Back to Argon Network" title="Back to Argon Network" class="inline-flex items-center min-h-11" @click="returnToArgon">
          <ChevronDoubleLeftIcon class="w-4 h-4 shrink-0" aria-hidden="true" />
        </a>
        <a href="https://argon.network/" aria-label="Argon Network"><Logo class="w-8 h-8 shrink-0" /></a>
      </span>
      <h1>Liquid Locking</h1>
    </div>
    <div class="header-results"><MobileResults /></div>
    <nav id="help-section" tabindex="-1" aria-label="Simulator actions" class="header-actions"><MoreInfoMenu /></nav>
  </header>
</template>
<script setup lang="ts">
import { ChevronDoubleLeftIcon } from '@heroicons/vue/24/outline';
import Logo from '../assets/logo.svg';
import MobileResults from './MobileResults.vue';
import MoreInfoMenu from '../components/MoreInfoMenu.vue';
function returnToArgon(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  try {
    if (new URL(document.referrer).hostname === 'argon.network' && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  } catch { /* An absent referrer uses the link's Argon homepage destination. */ }
}
</script>
<style scoped>
.app-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .5rem; padding: .6rem 1rem 0; border-bottom: 1px solid #b9bcc4; }
.branding { display: flex; align-items: center; gap: .6rem; min-width: 0; }
h1 { font-size: 1.2rem; font-weight: 300; color: #475569; }
.header-results { grid-column: 1 / -1; grid-row: 2; margin-inline: -1rem; padding: 1rem 1rem; border-top: 1px solid #b9bcc4; }
.header-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; }

</style>
