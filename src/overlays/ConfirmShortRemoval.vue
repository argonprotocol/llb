<template>
  <component :is="desktop ? DesktopDialog : MobileSheet" :open="!!short" :title="desktop ? removalTitle : 'Remove price drop?'" @close="short = null">
    <template v-if="desktop && short">
      <div class="flex items-start">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100"><ExclamationTriangleIcon class="h-6 w-6 text-red-600" /></div>
        <div class="ml-4">
          <h3 class="text-base font-semibold text-gray-900">{{ removalTitle }}</h3>
          <p class="mt-2 text-sm text-gray-500">Are you sure you want to remove the ${{ short.lowestPrice }} price drop {{ short.date === 'EXIT' ? 'that occurs right before you pull your bitcoin from the vault' : 'on ' + dayjs.utc(short.date).format('MMMM D, YYYY') }}? This action cannot be undone.</p>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-3 desktop-removal-actions">
        <button type="button" class="cancel" @click="short = null">Cancel</button><button type="button" class="remove" @click="remove">Remove</button>
      </div>
    </template>
    <template v-else>
      <p v-if="short" class="text-slate-600">Remove the drop to ${{ short.lowestPrice }} {{ short.date === 'EXIT' ? 'on the exit date' : 'on ' + short.date }}?</p>
      <div class="flex flex-wrap justify-end gap-2 mt-5"><button type="button" class="secondary-button" @click="short = null">Cancel</button><button type="button" class="primary-button" @click="remove">Remove</button></div>
    </template>
  </component>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import MobileSheet from '../components/MobileSheet.vue';
import DesktopDialog from '../components/DesktopDialog.vue';
import dayjs from 'dayjs';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { useDesktopLayout } from '../lib/ResponsiveLayout';
import { useBasicStore } from '../store';
import { useEvent } from '../lib/EventUtils';
import type { IClonableShort } from '../lib/Vault';
const store = useBasicStore();
const desktop = useDesktopLayout();
const short = ref<IClonableShort | null>(null);
const removalTitle = computed(() => 'Remove ' + (short.value?.date === 'EXIT' ? 'Final' : dayjs.utc(short.value?.date).format('MMMM D, YYYY')) + ' Price Drop');
useEvent<IClonableShort>('openConfirmShortRemoval', value => { short.value = value; });
function remove() { if (short.value) store.removePriceDrop(short.value.date); short.value = null; }
</script>
<style scoped>
.desktop-removal-actions button { border-radius: 6px; padding: 8px 12px; font-size: 14px; line-height: 20px; font-weight: 600; box-shadow: 0 1px 2px #0000000d; }
.cancel { background: white; color: #111827; box-shadow: inset 0 0 0 1px #d1d5db !important; }
.remove { background: #dc2626; color: white; } .remove:hover { background: #ef4444; }
</style>
