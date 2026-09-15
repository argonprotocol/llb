<template>
  <div class="desktop-more-info">
    <button ref="button" type="button" class="info-trigger" aria-label="Open actions and help" :aria-expanded="open" aria-haspopup="dialog" aria-controls="desktop-help-menu" @click="toggle"
      @mouseenter="hint" @mouseleave="hideTooltip()" @focus="hint" @blur="hideTooltip()"><InformationIcon class="outlined" /><InformationSolid class="solid" /></button>
    <DesktopPopover :open="open" :anchor="anchor" label="Learn more" id="desktop-help-menu" placement="bottom-end" width="max-content" :gap="8" :skid="40" focus-on-open @close="open = false">
      <nav class="desktop-help-links" aria-label="Learn more">
        <button type="button" @click="show('openDetailsOfLiquidLocking')">Details of Liquid Locking</button>
        <button type="button" @click="show('openFaqOverlay')">Frequently Asked Questions</button>
        <button type="button" class="divided" @click="show('openWhitepapersOverlay')">Read Our Whitepapers</button>
        <button type="button" class="divided" @click="show('openVideoOverlay')">Watch <em>Liquid Locking 101</em></button>
        <button type="button" class="divided" @click="tour">Take Our Guided Tour</button>
        <a class="divided" href="https://argon.network">Jump to Argon Network</a>
      </nav>
    </DesktopPopover>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import DesktopPopover from '../components/DesktopPopover.vue';
import InformationIcon from '../assets/information-outlined.svg';
import InformationSolid from '../assets/information-solid.svg';
import { showTooltip, hideTooltip } from '../lib/TooltipUtils';
import { hideInsight } from '../lib/InsightUtils';
import { useBasicStore } from '../store';
import emitter from '../emitters/basic';
const store = useBasicStore();
const open = ref(false);
const button = ref<HTMLButtonElement | null>(null);
const anchor = () => button.value;
const $menuButtonElem = computed(() => button.value);
defineExpose({ $menuButtonElem });
function hint(event: Event) { if (!open.value) showTooltip(event, 'Learn More'); }
function toggle() { hideTooltip(); hideInsight(true); open.value = !open.value; }
function show(event: string) { open.value = false; emitter.emit(event); }
function tour() { open.value = false; store.setConfig({ tourStep: 1 }); }
</script>
<style scoped>
.info-trigger { width: 32px; min-height: 44px; display: flex; align-items: center; justify-content: center; }
.info-trigger svg { width: 24px; height: 24px; }
.solid { display: none; }
.info-trigger:hover .outlined { display: none; }
.info-trigger:hover .solid { display: block; }
.desktop-help-links { padding: 4px; border-radius: 4px; font-size: 14px; line-height: 24px; font-weight: 300; color: #111827; text-align: right; white-space: nowrap; }
.desktop-help-links button, .desktop-help-links a { display: block; width: 100%; text-align: right; padding: 8px 12px; }
.desktop-help-links button:first-child, .desktop-help-links button:nth-child(2), .desktop-help-links button:nth-child(3) { padding-bottom: 4px; }
.desktop-help-links button:nth-child(4) { padding-top: 4px; }
.desktop-help-links .divided { border-top: 1px solid #e5e7eb; }
.desktop-help-links button:hover, .desktop-help-links a:hover { color: #c026d3; background: #faf4fc; }
</style>
