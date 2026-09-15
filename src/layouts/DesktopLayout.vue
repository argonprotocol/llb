<template>
  <div class="scenario-panel desktop-layout">
    <p class="desktop-intro"><strong>What is Liquid Locking?</strong> Liquid Locking is the process of depositing bitcoins into Argon Stabilization Vaults. In doing so, new argons equal to the value of the bitcoins are minted and liquidated into the market. This unlocks cash for the bitcoin holders. It also creates additional profit opportunities such as from bitcoin hedging and covering shorts from argon depegs.</p>
    <div ref="configSection" class="scenario-form">
      <section id="scenario-controls" tabindex="-1" class="configuration" :class="{ editing: editor.field !== null }">
        <h2>Configure Your Scenario</h2>
        <div class="config-field">
          <EditorButton field="bitcoinCount" desktop />{{ ' ' }}
          <span>{{ store.bitcoinCount === 1 ? 'bitcoin was' : 'bitcoins were' }} bought on
            <EditorButton field="dateLeft" desktop />
            for ${{ store.purchasePrice > 100 ? addCommas(Math.round(store.purchasePrice)) : store.purchasePrice.toFixed(2) }}
          </span>
          <div class="inline-insight"><span class="insight-bracket" aria-hidden="true"></span>Set the date when your bitcoin enters the Argon vaults. This determines when the downside risk of your bitcoin is hedged. The quantity or dollar amount of bitcoin does not change your percentage returns.</div>
        </div>
        <div class="config-field">{{ store.bitcoinCount === 1 ? "It's hodled" : "They're hodled" }} until
          <EditorButton field="dateRight" desktop />,
          exiting at ${{ exitPrice > 100 ? addCommas(Math.round(exitPrice)) : exitPrice.toFixed(2) }}
          <div class="inline-insight"><span class="insight-bracket" aria-hidden="true"></span>Set the date when you pull your bitcoin out of the Argon vaults. This is the date when the final profit calculations are determined.</div>
        </div>
        <div class="config-field">
          <span>{{ store.ratchetPct > 0 ? "Ratcheting is triggered when the price changes" : 'Ratcheting is' }}{{ ' ' }}</span>
          <EditorButton field="ratchetPct" desktop :label="store.ratchetPct === 0 ? 'disabled' : undefined" />{{ ' ' }}
          <span v-if="store.ratchetPct > 0">or more</span>
          <div class="inline-insight"><span class="insight-bracket" aria-hidden="true"></span>The lower your ratchet percentage, the tighter your hedge on downside risk, and therefore, the stronger your upside potential. Disable this feature by setting it to zero.</div>
        </div>
      </section>
      <section class="price-drops">
        <div class="price-drops-heading"><h2>Argon Price Drops</h2>{{ ' ' }}<span class="parenthesis">(</span><button class="add-price-drop rounded-full hover:bg-white/50" type="button" aria-label="Add price drop" insightId="addPriceDrop" @mouseenter="showInsight($event)" @mouseleave="hideInsight()" @focus="showInsight($event)" @blur="hideInsight()" @click="emitter.emit('openAddShort')">Add</button><span class="parenthesis">)</span></div>
        <p v-if="!store.shorts.length" class="field-help empty-drops italic py-2">No price drops configured</p>
        <div v-for="short in store.shorts" :key="short.date" class="drop-row" :class="{ inactive: !isActiveDrop(short, store.sliderDates) }" @mouseenter="emitter.emit('highlight', { isShort: true, date: short.date === 'EXIT' ? store.sliderDates.right : short.date })" @mouseleave="emitter.emit('unhighlight')">
          <div><span>{{ short.date === 'EXIT' ? `Argon collapses to $${short.lowestPrice} on the last day` : `On ${dayjs.utc(short.date).format('MMMM D, YYYY')} Argon drops from $${store.usdTargetForArgon} to $${short.lowestPrice}` }}</span>
            <small v-if="!isActiveDrop(short, store.sliderDates)" class="block">Outside the selected range · not applied</small></div>
          <button type="button" class="touch-button shrink-0" :aria-label="'Remove price drop ' + short.date" @click="emitter.emit('openConfirmShortRemoval', short)"><TrashIcon class="w-5 h-5" /></button>
        </div>
      </section>
      <div class="scenario-actions">
        <DesktopActivity />
        <button type="button" class="secondary-button" :disabled="!store.canExport" @click="store.downloadRawData()">Download Raw Data</button>
        <button type="button" class="video-link" @click="emitter.emit('openVideoOverlay')"><PlayIcon class="outlined w-5 h-5" /><PlaySolid class="solid w-5 h-5" /><span>Watch <em>Liquid Locking 101</em></span></button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue';
import dayjs from 'dayjs';
import { TrashIcon } from '@heroicons/vue/24/outline';
import EditorButton from '../components/EditorButton.vue';
import DesktopActivity from './DesktopActivity.vue';
import PlayIcon from '../assets/play-outlined.svg';
import PlaySolid from '../assets/play-solid.svg';
import { useBasicStore } from '../store';
import { addCommas } from '../lib/BasicUtils';
import { isActiveDrop } from '../lib/ScenarioConfig';
import { useScenarioEditor } from '../lib/ScenarioEditor';
import { showInsight, hideInsight } from '../lib/InsightUtils';
import emitter from '../emitters/basic';
const store = useBasicStore();
const editor = useScenarioEditor();
const exitPrice = computed(() => store.bitcoinPrices.prices[store.sliderIndexes.right].price);
const configSection = ref<HTMLElement | null>(null);
onScopeDispose(store.registerPositionCheck('configSection', () => configSection.value?.getBoundingClientRect() || new DOMRect()));
onScopeDispose(() => emitter.emit('unhighlight'));
</script>
<style scoped>
.config-field { border-top: 1px solid #94a3b866; }
.field-help { color: #64748b; font-size: .8rem; line-height: 1.5; }
.parenthesis { color: #94a3b899; }
.drop-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.drop-row.inactive { color: #64748b; }
.scenario-actions { display: flex; align-items: flex-start; }
.video-link { display: flex; align-items: center; }
.scenario-panel { position: absolute; top: 15%; left: 80px; width: calc((100% - 80px) * .45); max-width: none; margin: 0; display: block; }
.desktop-intro { display: block; font-size: 16px; line-height: 24px; font-weight: 300; color: #334155cc; }
.desktop-intro strong { font-weight: 700; }
.scenario-form { display: block; position: absolute; left: 0; top: calc(100% + 1.75rem); width: max-content; }
.configuration { border-bottom: 1px solid #94a3b866; text-transform: uppercase; font-size: 14px; line-height: 20px; white-space: nowrap; }
h2 { margin: 0; padding: 4px 0; font-size: 16px; line-height: 24px; font-weight: 600; color: black; text-transform: uppercase; }
.config-field { position: relative; display: block; padding: 8px 12px 8px 0; border-color: #94a3b866; }
.inline-insight { display: none; position: absolute; left: calc(100% + 56px); top: 50%; transform: translateY(-50%); width: 300px; white-space: normal; text-transform: none; color: #334155b3; }
.configuration:not(.editing) .config-field:hover .inline-insight { display: block; }
.insight-bracket { position: absolute; left: -32px; top: -22px; bottom: -18px; width: 24px; border: 1px solid #94a3b866; border-right: 0; border-radius: 24px 0 0 24px; }
.insight-bracket::before, .insight-bracket::after { content: ''; position: absolute; left: -16px; top: 50%; margin-top: -14px; border-top: 18px solid transparent; border-bottom: 18px solid transparent; border-right: 16px solid #94a3b866; }
.insight-bracket::after { left: -14.5px; border-right-color: #e6eaf3; }
.price-drops { margin-top: 16px; font-size: 14px; line-height: 20px; text-transform: uppercase; }
.price-drops-heading { display: block; border-bottom: 1px solid #94a3b866; font-weight: 600; font-size: 16px; line-height: 24px; padding: 4px 0; }
.price-drops-heading h2 { display: inline; padding: 0; }
.add-price-drop { border: 0; padding: 0 4px; min-height: 0; background: transparent; font: inherit; text-transform: uppercase; color: #a21caf; }
.field-help.target-price { padding: 4px 0; font-size: 12px; line-height: 16px; text-transform: none; }
.empty-drops { border-bottom: 1px solid #94a3b866; font-size: 14px; line-height: 20px; color: #64748bcc; }
.drop-row { position: relative; padding: 8px 32px 8px 0; border-top: 0; border-bottom: 1px solid #94a3b866; }
.drop-row small { text-transform: none; }
.drop-row > button { position: absolute; right: 0; top: 6px; min-width: 24px; min-height: 24px; border: 1px solid #94a3b8cc; border-radius: 4px; color: #a21caf; }
.drop-row > button :deep(svg) { width: 16px; height: 16px; }
.scenario-actions { position: absolute; top: calc(100% + 20px); left: 0; flex-wrap: nowrap; gap: 16px; white-space: nowrap; z-index: 5; }
.scenario-actions > .secondary-button, .scenario-actions > div > .secondary-button { min-height: 0; border-color: #94a3b8; color: #a21caf; padding: 6px 24px; font-size: 16px; line-height: 24px; border-radius: 6px; background: #ffffff80; }
.scenario-actions .secondary-button:hover { background: white; }
.video-link { min-height: 38px; padding-left: 4px; gap: 8px; font-weight: 700; color: #c026d3; text-decoration: none; }
.video-link .solid { display: none; }
.video-link:hover .outlined { display: none; }
.video-link:hover .solid { display: block; }
.video-link span { text-decoration: underline dashed #f0abfc; text-underline-offset: 4px; }
.video-link em { font-style: italic; }
.video-link :deep(svg) { width: 24px; height: 24px; }
.video-link :deep(svg path) { fill: #c026d3; }
</style>
