<template>
  <template v-if="editor.isDate">
    <p v-if="!desktop" class="text-sm text-slate-500 mb-3">Choose a date. The range must span at least six calendar months.</p>
    <div :class="{ 'desktop-calendar': desktop }">
    <DatePicker :model-value="editor.calendarValue" :initial-page="editor.calendarPage" @did-move="editor.rememberCalendarPage" @update:model-value="editor.selectDate" :min-date="editor.bounds?.min" :max-date="editor.bounds?.max" timezone="UTC" is-required :expanded="!desktop" :color="desktop ? 'blue' : 'purple'">
      <template #header-prev-button><svg v-if="desktop" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="24" height="24" class="vc-base-icon"><polyline points="15 18 9 12 15 6" /></svg><span v-else aria-hidden="true">‹</span><span class="sr-only">Previous month</span></template>
      <template #header-next-button><svg v-if="desktop" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="24" height="24" class="vc-base-icon"><polyline points="9 18 15 12 9 6" /></svg><span v-else aria-hidden="true">›</span><span class="sr-only">Next month</span></template>
      <template #nav-prev-button><svg v-if="desktop" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="24" height="24" class="vc-base-icon"><polyline points="15 18 9 12 15 6" /></svg><span v-else aria-hidden="true">‹</span><span class="sr-only">Previous period</span></template>
      <template #nav-next-button><svg v-if="desktop" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="24" height="24" class="vc-base-icon"><polyline points="9 18 15 12 9 6" /></svg><span v-else aria-hidden="true">›</span><span class="sr-only">Next period</span></template>
    </DatePicker>
    </div>
  </template>
  <form v-else @submit.prevent="editor.save" class="editor-form" :class="{ 'desktop-fields': desktop }">
    <label :for="editor.field + '-input'" class="block text-sm font-medium mb-2">{{ desktop && editor.field === 'ratchetPct' ? 'Percent Price Must Change' : editor.title }}</label>
    <div class="editor-input-row flex items-center gap-3">
      <input :id="editor.field + '-input'" v-model="editor.draft" type="text" :inputmode="editor.field === 'bitcoinCount' ? 'numeric' : 'decimal'" class="field-input" autocomplete="off" @keydown.up.prevent="editor.adjustDraft(1)" @keydown.down.prevent="editor.adjustDraft(-1)" />
      <span class="editor-unit">{{ editor.field === 'bitcoinCount' ? 'BTC' : '%' }}</span>
    </div>
    <p v-if="!desktop" class="text-sm text-slate-500 mt-2">{{ editor.field === 'bitcoinCount' ? 'Whole bitcoins, with a minimum of one.' : 'Use 0% to disable ratcheting. Maximum 100%.' }}</p>
    <div class="editor-actions flex flex-wrap justify-end gap-2 mt-5">
      <button type="button" class="secondary-button" @click="editor.close">Cancel</button>
      <button type="submit" class="primary-button">Save</button>
    </div>
  </form>
  <p v-if="editor.error" role="alert" class="mt-3 text-sm text-red-700">{{ editor.error }}</p>

</template>
<script setup lang="ts">
import { DatePicker } from '@angelblanco/v-calendar';
import '@angelblanco/v-calendar/style.css';
import { useScenarioEditor } from '../lib/ScenarioEditor';
defineProps<{ desktop?: boolean }>();
const editor = useScenarioEditor();
</script>
<style scoped>
.desktop-calendar { border: 1px solid #cbd5e0; border-radius: 6px; }
.desktop-calendar :deep(.vc-container) { border: 0; }
.desktop-fields { padding: 20px 24px 16px 20px; }
.desktop-fields label { font-size: 14px; line-height: 24px; text-transform: uppercase; margin-bottom: 8px; }
.desktop-fields .editor-input-row { position: relative; display: block; }
.desktop-fields input { min-height: 0; height: 36px; border: 0; padding: 6px 44px 6px 12px; border-radius: 6px; font-size: 14px; line-height: 24px; color: #111827; box-shadow: inset 0 0 0 1px #d1d5db, 0 1px 2px #0000000d; }
.desktop-fields input:focus { outline: 2px solid #4f46e5; outline-offset: -2px; }
.desktop-fields .editor-unit { position: absolute; right: 12px; top: 6px; color: #6b7280; font-size: 14px; line-height: 24px; pointer-events: none; }
.desktop-fields .editor-actions { justify-content: flex-start; gap: 12px; margin-top: 20px; }
.desktop-fields button { min-height: 0; padding: 6px 12px; border: 1px solid transparent; border-radius: 6px; font-size: 14px; line-height: 20px; font-weight: 600; box-shadow: 0 1px 2px #0000000d; }
.desktop-fields .secondary-button { background: white; color: #111827; box-shadow: inset 0 0 0 1px #d1d5db, 0 1px 2px #0000000d; }
.desktop-fields .primary-button { padding: 6px 20px; border-color: #86198f; background: #c026d3; }
.desktop-fields .primary-button:hover { background: #d946ef; }
</style>
