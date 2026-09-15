<template>
  <div class="scenario-panel mobile-layout">
    <details class="intro">
      <summary>What is Liquid Locking?</summary>
      <p>Liquid Locking is the process of depositing bitcoins into Argon Stabilization Vaults. New argons equal to the value of the bitcoins are minted and liquidated into the market. This unlocks cash for bitcoin holders and creates opportunities from bitcoin hedging and covering shorts from argon depegs.</p>
    </details>
    <ChartDateControls :selected="selected" @select="$emit('select', $event)" @key="(event, side) => $emit('key', event, side)" />
    <section id="scenario-controls" tabindex="-1" class="configuration">
      <h2>Configure Your Scenario</h2>
      <div class="config-field"><label for="bitcoinCount-trigger">Bitcoin Quantity</label><EditorButton field="bitcoinCount" /></div>
      <div class="config-field">
        <label for="ratchetPct-trigger">Ratchet Threshold</label>
        <EditorButton field="ratchetPct" :label="store.ratchetPct === 0 ? 'Disabled (0%)' : undefined" />
      </div>
    </section>
    <section class="price-drops">
      <div class="price-drops-heading"><h2>Argon Price Drops</h2><button class="add-price-drop" type="button" aria-label="Add price drop" @click="emitter.emit('openAddShort')">(<span>Add</span>)</button></div>
      <p v-if="!store.shorts.length" class="field-help italic py-2">No price drops configured</p>
      <div v-for="short in store.shorts" :key="short.date" class="drop-row" :class="{ inactive: !isActiveDrop(short, store.sliderDates) }">
        <div>{{ short.date === 'EXIT' ? 'On the exit date' : dayjs.utc(short.date).format('MMM D, YYYY') }}: ${{ short.lowestPrice }}
          <small v-if="!isActiveDrop(short, store.sliderDates)" class="block">Outside the selected range · not applied</small></div>
        <button type="button" class="touch-button shrink-0" :aria-label="'Remove price drop ' + short.date" @click="emitter.emit('openConfirmShortRemoval', short)"><TrashIcon class="w-5 h-5" /></button>
      </div>
    </section>
    <div class="scenario-actions">
      <details class="mobile-activity"><summary class="video-link"><QueueListIcon class="w-5 h-5" aria-hidden="true" /><span>Show Vault Activity</span></summary><ActionsList /></details>
      <button type="button" class="video-link" @click="emitter.emit('openVideoOverlay')"><PlayIcon class="w-5 h-5" /><span>Watch <em>Liquid Locking 101</em></span></button>
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { QueueListIcon, TrashIcon } from '@heroicons/vue/24/outline';
import ChartDateControls from '../components/ChartDateControls.vue';
import EditorButton from '../components/EditorButton.vue';
import ActionsList from '../overlays/ActionsList.vue';
import PlayIcon from '../assets/play-outlined.svg';
import { useBasicStore } from '../store';
import { isActiveDrop, type Side } from '../lib/ScenarioConfig';
import emitter from '../emitters/basic';
defineProps<{ selected: Side }>();
defineEmits<{ select: [side: Side]; key: [event: KeyboardEvent, side: Side] }>();
const store = useBasicStore();
</script>
<style scoped>
.scenario-panel { display: flex; flex-direction: column; gap: 1.1rem; max-width: 54rem; margin: 0 auto; }
.price-drops { margin-inline: -1rem; padding: .5rem 1rem 0; border-top: 1px solid #b9bcc4; }
.price-drops-heading { display: flex; align-items: center; gap: .5rem; }
.price-drops-heading h2 { margin-bottom: 0; }
.add-price-drop { min-height: 44px; min-width: 44px; border: 0; background: transparent; color: #334155; font-size: .95rem; font-weight: 600; }
.add-price-drop span { color: #a21caf; }
.intro { order: 10; color: #64748b; font-size: .9rem; }
.intro summary { font-weight: 600; cursor: pointer; min-height: 44px; padding: .6rem 0; }
.intro p { margin: .5rem 0; line-height: 1.6; }
h2 { font-size: .95rem; font-weight: 600; color: #334155; margin-bottom: .4rem; }
.config-field { display: flex; align-items: center; justify-content: space-between; gap: .75rem; border-top: 1px solid #94a3b83d; padding: .4rem 0; }
.config-field :deep(.editor-trigger) { min-height: 32px; padding-block: .25rem; }
.config-field output { overflow-wrap: anywhere; min-width: 0; text-align: right; }
.field-help { color: #64748b; font-size: .8rem; line-height: 1.5; }
.drop-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .4rem 0; border-top: 1px solid #94a3b83d; }
.drop-row.inactive { color: #64748b; }
.scenario-actions { display: flex; flex-wrap: wrap; gap: .75rem; align-items: flex-start; margin-inline: -1rem; padding: .5rem 1rem 0; border-top: 1px solid #b9bcc4; }
.mobile-activity { width: 100%; }
.mobile-activity > summary { cursor: pointer; list-style: none; }
.mobile-activity > summary::-webkit-details-marker { display: none; }
.video-link { display: flex; align-items: center; gap: .4rem; min-height: 44px; color: #a21caf; text-decoration: underline; text-underline-offset: 3px; }
.video-link em { font-style: normal; }

</style>
