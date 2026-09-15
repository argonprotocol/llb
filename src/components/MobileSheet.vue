<template>
  <Dialog :open="open" @close="$emit('close')" class="app-dialog relative z-[4000]">
    <div class="fixed inset-0 bg-slate-900/50" aria-hidden="true" />
    <div class="fixed inset-0 overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center" :style="viewportStyle">
      <DialogPanel class="sheet-panel w-full min-w-0 rounded-xl bg-white shadow-xl my-auto" :style="{ maxWidth, maxHeight: usableHeight ? Math.max(0, usableHeight - 48) + 'px' : undefined }">
        <header class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
          <DialogTitle class="text-lg font-semibold text-slate-800 min-w-0">{{ title }}</DialogTitle>
          <button type="button" @click="$emit('close')" aria-label="Close dialog" class="touch-button shrink-0 text-slate-500"><XMarkIcon class="w-5 h-5" /></button>
        </header>
        <div class="sheet-content p-4"><slot /></div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { onScopeDispose, ref, watch, type CSSProperties } from 'vue';
const props = withDefaults(defineProps<{ open: boolean; title: string; maxWidth?: string }>(), { maxWidth: '36rem' });
defineEmits<{ close: [] }>();
const viewportStyle = ref<CSSProperties>({});
const usableHeight = ref(0);
const viewport = window.visualViewport;
function updateViewport() {
  if (!viewport) return;
  usableHeight.value = viewport.height;
  viewportStyle.value = { top: viewport.offsetTop + 'px', height: viewport.height + 'px', bottom: 'auto' };
}
function stopListening() { viewport?.removeEventListener('resize', updateViewport); viewport?.removeEventListener('scroll', updateViewport); }
watch(() => props.open, open => {
  stopListening();
  if (!open) return;
  updateViewport();
  // The visual viewport also reflects software keyboards that do not resize
  // the layout viewport. Keep the dialog header and scrolling body inside it.
  viewport?.addEventListener('resize', updateViewport);
  viewport?.addEventListener('scroll', updateViewport);
}, { immediate: true });
onScopeDispose(stopListening);
</script>
