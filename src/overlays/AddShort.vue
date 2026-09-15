<template>
  <component :is="desktop ? DesktopDialog : MobileSheet" :open="isOpen" :title="desktop ? 'Add New Price Drop' : 'Add a price drop'" @close="isOpen = false">
    <form @submit.prevent="insert" :class="{ 'desktop-price-drop': desktop }">
      <div v-if="desktop" class="ml-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New Price Drop</h3>
        <p class="text-sm text-gray-500 mt-2">Choose a date and price for the Argon to drop below its target. The simulation will then react to the drop using the Argon protocol, which allows your vaulted bitcoin to cover the short.</p>
        <div class="flex flex-col gap-2 mt-2">
          <DatePicker :model-value="date ? dayjs.utc(date).toDate() : null" :initial-page="calendarPage || initialPage" @did-move="rememberPage"
            @update:model-value="selectDate" timezone="UTC" :min-date="minDate" :max-date="maxDate" :disabled-dates="disabledDates" is-required color="blue">
            <template #default="{ togglePopover }">
              <label for="drop-date-trigger" class="mb-1 block text-sm leading-6 font-medium">Date of Drop</label>
              <div class="relative">
                <button id="drop-date-trigger" type="button" class="date-input" :class="{ empty: !date }" @click="togglePopover">{{ date ? dayjs.utc(date).format('MMMM D, YYYY') : 'Select Date' }}</button>
                <CalendarIcon class="pointer-events-none absolute right-3 top-2 w-5 h-5 text-gray-400" />
              </div>
            </template>
          </DatePicker>
          <div>
            <label for="drop-price" class="mb-1 block text-sm leading-6 font-medium">Lowest Price</label>
            <div class="relative">
              <span class="price-prefix">$</span>
              <input id="drop-price" v-model="lowestPrice" type="text" inputmode="decimal" autocomplete="off" class="price-input" />
              <span class="price-unit">USD</span>
            </div>
          </div>
        </div>
      </div>
      <template v-else>
      <p class="text-sm text-slate-500 mb-4">Choose a date inside your selected range and a USD price below the ${{ store.usdTargetForArgon }} Argon target.</p>
      <label class="block text-sm font-medium mb-2" for="drop-date-trigger">Date of drop</label>
      <button id="drop-date-trigger" type="button" class="secondary-button w-full" :aria-expanded="calendarOpen" @click="calendarOpen = !calendarOpen">{{ date ? dayjs.utc(date).format('MMM D, YYYY') : 'Choose date' }}</button>
      <DatePicker v-if="calendarOpen" :model-value="date ? dayjs.utc(date).toDate() : null" :initial-page="calendarPage || initialPage" @did-move="rememberPage" @update:model-value="selectDate" timezone="UTC" :min-date="minDate" :max-date="maxDate" :disabled-dates="disabledDates" expanded is-required color="purple">
        <template #header-prev-button><span aria-hidden="true">‹</span><span class="sr-only">Previous month</span></template>
        <template #header-next-button><span aria-hidden="true">›</span><span class="sr-only">Next month</span></template>
        <template #nav-prev-button><span aria-hidden="true">‹</span><span class="sr-only">Previous period</span></template>
        <template #nav-next-button><span aria-hidden="true">›</span><span class="sr-only">Next period</span></template>
      </DatePicker>
      <label class="block text-sm font-medium mt-4 mb-2" for="drop-price">Lowest price (USD per ARGN)</label>
      <input id="drop-price" v-model="lowestPrice" type="text" inputmode="decimal" autocomplete="off" class="field-input" />

      </template>
      <p v-if="validationError" role="alert" class="mt-3 text-sm text-red-700">{{ validationError }}</p>
      <div class="drop-actions flex flex-wrap justify-end gap-2 mt-5"><button type="button" class="secondary-button" @click="isOpen = false">Cancel</button><button type="submit" class="primary-button">Insert</button></div>
    </form>
  </component>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import { DatePicker } from '@angelblanco/v-calendar';
import MobileSheet from '../components/MobileSheet.vue';
import DesktopDialog from '../components/DesktopDialog.vue';
import { CalendarIcon } from '@heroicons/vue/24/outline';
import { useDesktopLayout } from '../lib/ResponsiveLayout';
import { hideInsight } from '../lib/InsightUtils';
import { useBasicStore } from '../store';
import { useEvent } from '../lib/EventUtils';
import { dateOnly } from '../lib/ScenarioConfig';
const store = useBasicStore();
const desktop = useDesktopLayout();
const calendarPage = ref<{ year: number; month: number }>();
function rememberPage(pages: { year: number; month: number }[]) { if (pages[0]) calendarPage.value = { year: pages[0].year, month: pages[0].month }; }
const isOpen = ref(false);
const calendarOpen = ref(false);
const date = ref('');
const lowestPrice = ref('0.001');
const validationError = ref('');
const minDate = computed(() => dayjs.utc(store.sliderDates.left).add(1, 'day').format('YYYY-MM-DD'));
const maxDate = computed(() => dayjs.utc(store.sliderDates.right).subtract(1, 'day').format('YYYY-MM-DD'));
const initialPage = computed(() => ({ year: dayjs.utc(minDate.value).year(), month: dayjs.utc(minDate.value).month() + 1 }));
const disabledDates = computed(() => store.shorts.filter(short => short.date !== 'EXIT').map(short => dayjs.utc(short.date).toDate()));
useEvent('openAddShort', () => {
  hideInsight(true); calendarPage.value = undefined;
  date.value = ''; lowestPrice.value = '0.001'; validationError.value = ''; calendarOpen.value = false; isOpen.value = true;
});
function selectDate(value: unknown) { date.value = dateOnly(value); calendarOpen.value = false; }
function insert() {
  try { store.addPriceDrop(date.value, lowestPrice.value); isOpen.value = false; }
  catch (error) { validationError.value = (error as Error).message; }
}
</script>
<style scoped>
.desktop-price-drop .date-input, .desktop-price-drop .price-input { display: block; width: 100%; min-height: 0; height: 36px; padding: 6px 40px 6px 12px; border: 0; border-radius: 6px; box-shadow: inset 0 0 0 1px #d1d5db; font-size: 14px; line-height: 24px; text-align: left; color: #111827; }
.desktop-price-drop .price-input { padding-left: 28px; padding-right: 48px; }
.desktop-price-drop .date-input.empty { color: #9ca3af; }
.price-prefix, .price-unit { position: absolute; top: 8px; color: #6b7280; font-size: 14px; line-height: 20px; pointer-events: none; }
.price-prefix { left: 12px; } .price-unit { right: 12px; }
.desktop-price-drop .drop-actions { margin-top: 28px; gap: 12px; }
.desktop-price-drop .drop-actions button { min-height: 0; padding: 8px 12px; border: 0; font-size: 14px; line-height: 20px; font-weight: 600; border-radius: 6px; }
.desktop-price-drop .secondary-button { background: white; color: #111827; box-shadow: inset 0 0 0 1px #d1d5db, 0 1px 2px #0000000d; }
.desktop-price-drop .primary-button { background: #c026d3; color: white; }
.desktop-price-drop .primary-button:hover { background: #d946ef; }
</style>
