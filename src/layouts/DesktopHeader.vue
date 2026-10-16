<template>
  <header class="app-header">
    <div class="branding">
      <span class="inline-flex items-center gap-1 shrink-0 text-[#73179e]">
        <a href="https://argon.network/" aria-label="Back to Argon Network" title="Back to Argon Network" class="inline-flex items-center min-h-11" @click="returnToArgon">
          <ChevronDoubleLeftIcon class="w-8 shrink-0 stroke-1 opacity-40 hover:opacity-100" aria-hidden="true" />
        </a>
        <a href="https://argon.network/" aria-label="Argon Network"><Logo class="w-8 h-8 shrink-0" /></a>
      </span>
      <div class="model-selector" @mouseenter="isModelMenuOpen = true" @mouseleave="isModelMenuOpen = false" @focusin="isModelMenuOpen = true" @focusout="closeModelMenuOnBlur" @keydown.esc.stop.prevent="isModelMenuOpen = false">
        <h1><button type="button" class="model-selector-button" :aria-expanded="isModelMenuOpen" aria-controls="model-navigation" @click="isModelMenuOpen = true" @keydown.down.prevent="isModelMenuOpen = true">
          Liquid Locking for Bitcoin
          <svg class="model-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" /></svg>
        </button></h1>
        <nav v-show="isModelMenuOpen" id="model-navigation" class="model-dropdown" aria-label="Models">
            <a href="https://uds.argon.network/">Ultimate Death Spiral</a>
            <a href="https://ege.argon.network/">Exponential Growth Engine</a>
        </nav>
      </div>
    </div>
    <div class="header-results"><DesktopResults /></div>
    <nav id="help-section" tabindex="-1" aria-label="Simulator actions" class="header-actions">
      <button type="button" class="touch-button desktop-action" aria-label="Reset to defaults" @mouseenter="showTooltip($event, 'Reset to Default')" @mouseleave="hideTooltip()" @focus="showTooltip($event, 'Reset to Default')" @blur="hideTooltip()" @click="emitter.emit('openConfirmConfigReset')"><ResetIcon class="outlined w-6 h-6" /><ResetSolid class="solid w-6 h-6" /></button>
      <button type="button" class="touch-button desktop-action" aria-label="Download raw data" @mouseenter="showTooltip($event, 'Download')" @mouseleave="hideTooltip()" @focus="showTooltip($event, 'Download')" @blur="hideTooltip()" :disabled="!store.canExport" @click="store.downloadRawData()"><DownloadIcon class="outlined w-6 h-6" /><DownloadSolid class="solid w-6 h-6" /></button>
      <button type="button" class="touch-button desktop-action" aria-label="Watch video" @mouseenter="showTooltip($event, 'Watch Video')" @mouseleave="hideTooltip()" @focus="showTooltip($event, 'Watch Video')" @blur="hideTooltip()" @click="emitter.emit('openVideoOverlay')"><PlayIcon class="outlined w-6 h-6" /><PlaySolid class="solid w-6 h-6" /></button>
      <DesktopMoreInfo ref="menuRef" />
      <a class="touch-button desktop-action" aria-label="Open source code" @mouseenter="showTooltip($event, 'Open Codebase')" @mouseleave="hideTooltip()" @focus="showTooltip($event, 'Open Codebase')" @blur="hideTooltip()" href="https://github.com/argonprotocol/llb" target="_blank" rel="noopener noreferrer"><GithubIcon class="outlined w-6 h-6" /><GithubSolid class="solid w-6 h-6" /></a>
    </nav>
  </header>
</template>
<script setup lang="ts">
const isModelMenuOpen = ref(false);
function closeModelMenuOnBlur(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
    isModelMenuOpen.value = false;
  }
}
import { onScopeDispose, ref } from 'vue';
import { ChevronDoubleLeftIcon } from '@heroicons/vue/24/outline';
import Logo from '../assets/logo.svg';
import ResetIcon from '../assets/reset-outlined.svg';
import ResetSolid from '../assets/reset-solid.svg';
import DownloadIcon from '../assets/download-outlined.svg';
import DownloadSolid from '../assets/download-solid.svg';
import PlayIcon from '../assets/play-outlined.svg';
import PlaySolid from '../assets/play-solid.svg';
import GithubIcon from '../assets/github-outlined.svg';
import GithubSolid from '../assets/github-solid.svg';
import DesktopResults from './DesktopResults.vue';
import DesktopMoreInfo from './DesktopMoreInfo.vue';
import { showTooltip, hideTooltip } from '../lib/TooltipUtils';
import { useBasicStore } from '../store';
import emitter from '../emitters/basic';
const store = useBasicStore();
const menuRef = ref<InstanceType<typeof DesktopMoreInfo> | null>(null);
onScopeDispose(store.registerPositionCheck('informationIcon', () => menuRef.value?.$menuButtonElem?.getBoundingClientRect() || new DOMRect()));
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
.model-dropdown { position: absolute; left: 0; top: 100%; z-index: 3000; width: max-content; max-width: calc(100vw - 32px); padding: 4px; border-radius: 4px; background: white; box-shadow: 0 10px 15px -3px #0000001a, 0 0 0 1px #1118270d; font-size: 1.25rem; font-weight: 200; line-height: 1.4; color: #475569; }
.model-dropdown a { display: block; position: static; padding: 8px 12px; border-radius: 3px; color: inherit; text-decoration: none; white-space: normal; }
.model-dropdown a:hover, .model-dropdown a:focus-visible { color: #73179e; background: #FAF4FC; }
.model-selector h1 { white-space: normal; }

.app-header { border-bottom: 1px solid #b9bcc4; }
.branding { display: flex; align-items: center; }
h1 { color: #475569; }
.header-actions { display: flex; align-items: center; justify-content: flex-end; }
.app-header { display: flex; align-items: center; gap: 0; padding: 0 0 0 1rem; height: 57px; position: relative; z-index: 10; box-shadow: 0 1px 0 white; color: black; }
.branding { width: 33.333333%; min-width: auto; gap: 10px; }
.branding a { position: relative; top: 1px; flex-shrink: 0; }
.branding :deep(svg:not([aria-hidden]) path) { fill: #73179e; }
h1 { position: relative; top: .5px; padding: .75rem 0; font-size: 1.5rem; line-height: 2rem; font-weight: 200; white-space: nowrap; }
.header-results { position: relative; height: 100%; min-width: 58%; padding: 0; }
.header-results :deep(.results-summary) { position: absolute; left: 55%; top: 0; min-width: 83%; transform: translateX(-50%); z-index: 1000; }
.header-actions { width: 33.333333%; padding-right: 1rem; gap: .25rem; flex-wrap: nowrap; }
.desktop-action { display: inline-flex; min-width: 32px; min-height: 44px; flex-shrink: 0; }
.desktop-action .solid { display: none; }
.desktop-action:hover .outlined { display: none; }
.desktop-action:hover .solid { display: block; }
</style>
