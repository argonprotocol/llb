<template>
  <header class="app-header">
    <div class="branding">
      <span class="inline-flex items-center gap-1 shrink-0 text-[#73179e]">
        <a href="https://argon.network/" aria-label="Back to Argon Network" title="Back to Argon Network" class="inline-flex items-center min-h-11" @click="returnToArgon">
          <ChevronDoubleLeftIcon class="w-4 h-4 shrink-0" aria-hidden="true" />
        </a>
        <a href="https://argon.network/" aria-label="Argon Network"><Logo class="w-8 h-8 shrink-0" /></a>
      </span>
      <div class="model-selector" @mouseenter="isModelMenuOpen = true" @mouseleave="isModelMenuOpen = false" @focusin="isModelMenuOpen = true" @focusout="closeModelMenuOnBlur" @keydown.esc.stop.prevent="isModelMenuOpen = false">
        <h1><button type="button" class="model-selector-button" :aria-expanded="isModelMenuOpen" aria-controls="model-navigation" @click="isModelMenuOpen = true" @keydown.down.prevent="isModelMenuOpen = true">
          Liquid Locking
          <svg class="model-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" /></svg>
        </button></h1>
        <nav v-show="isModelMenuOpen" id="model-navigation" class="model-dropdown" aria-label="Models">
            <a href="https://uds.argon.network/">Ultimate Death Spiral</a>
            <a href="https://ege.argon.network/">Exponential Growth Engine</a>
        </nav>
      </div>
    </div>
    <div class="header-results"><MobileResults /></div>
    <nav id="help-section" tabindex="-1" aria-label="Simulator actions" class="header-actions"><MoreInfoMenu /></nav>
  </header>
</template>
<script setup lang="ts">
const isModelMenuOpen = ref(false);
function closeModelMenuOnBlur(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
    isModelMenuOpen.value = false;
  }
}
import { ref } from 'vue';
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
.model-selector { position: relative; min-width: 0; }
.model-selector-button { display: flex; align-items: center; gap: 8px; padding: 0; border: 0; background: transparent; font: inherit; color: inherit; text-align: left; cursor: pointer; }
.model-selector-button:focus-visible { outline: 2px solid #a526df; outline-offset: 4px; border-radius: 4px; }
.model-caret { width: 16px; height: 16px; flex-shrink: 0; }
.model-dropdown { position: absolute; left: 0; top: 100%; z-index: 3000; width: max-content; max-width: calc(100vw - 32px); padding: 4px; border-radius: 4px; background: white; box-shadow: 0 10px 15px -3px #0000001a, 0 0 0 1px #1118270d; font-size: 1rem; font-weight: 300; line-height: 1.4; color: #475569; }
.model-dropdown a { display: block; position: static; padding: 8px 12px; border-radius: 3px; color: inherit; text-decoration: none; white-space: normal; }
.model-dropdown a:hover, .model-dropdown a:focus-visible { color: #73179e; background: #FAF4FC; }
.model-selector h1 { white-space: normal; }

.app-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .5rem; padding: .6rem 1rem 0; border-bottom: 1px solid #b9bcc4; }
.branding { display: flex; align-items: center; gap: .6rem; min-width: 0; }
h1 { font-size: 1.2rem; font-weight: 300; color: #475569; }
.header-results { grid-column: 1 / -1; grid-row: 2; margin-inline: -1rem; padding: 1rem 1rem; border-top: 1px solid #b9bcc4; }
.header-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; }

</style>
