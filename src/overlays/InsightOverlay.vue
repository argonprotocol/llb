<template>
  <MobileSheet :open="isOpen && !desktop" :title="title" max-width="46rem" @close="close">
    <InsightContent :id="id" :data="data" />
  </MobileSheet>
  <DesktopPopover v-if="desktop" :open="isOpen" :anchor="anchor" :anchor-key="id" :alignment="alignment" :match-alignment-width="isReturn"
    :label="title" :interactive="sticky" :focus-on-open="sticky" :placement="placement" width="24rem" :gap="placement === 'right' ? 10 : 7" @close="close">
    <div class="desktop-insight"><InsightContent :id="id" :data="data" desktop /></div>
  </DesktopPopover>
</template>
<script setup lang="ts">
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue';
import MobileSheet from '../components/MobileSheet.vue';
import DesktopPopover from '../components/DesktopPopover.vue';
import InsightContent from '../components/InsightContent.vue';
import { useEvent } from '../lib/EventUtils';
import { useDesktopLayout } from '../lib/ResponsiveLayout';
import { useBasicStore } from '../store';
const desktop = useDesktopLayout();
const store = useBasicStore();
const isOpen = ref(false);
const sticky = ref(false);
const id = ref('');
const data = ref<Record<string, any>>({});
const source = shallowRef<HTMLElement | null>(null);
const isReturn = computed(() => id.value === 'vaulterReturns' || id.value === 'hodlerReturns');
const anchor = () => source.value?.isConnected ? source.value : document.querySelector<HTMLElement>('[insightId="' + id.value + '"]');
const alignment = () => isReturn.value ? anchor()?.closest('.results-summary')?.querySelector<HTMLElement>('.result-metrics') || null : null;
const placement = computed(() => id.value === 'addPriceDrop' ? 'right' : 'bottom-start');
const title = computed(() => ({ ratchets: 'Ratcheting', shorts: 'Argon Shorts', cashUnlocked: 'Accrued cash', vaulterReturns: 'Liquid Locking returns', hodlerReturns: 'Hodling returns', addPriceDrop: 'Argon price drops' }[id.value] || 'Liquid Locking'));
useEvent<{ id: string; anchor: HTMLElement; data: Record<string, any>; isSticky: boolean }>('showInsight', incoming => {
  if (isOpen.value && sticky.value && !incoming.isSticky) return;
  if (isOpen.value && sticky.value && incoming.isSticky && id.value === incoming.id) { close(); return; }
  id.value = incoming.id; source.value = incoming.anchor;
  data.value = incoming.data; sticky.value = incoming.isSticky; isOpen.value = true;
});
useEvent<{ force?: boolean } | undefined>('hideInsight', incoming => { if (!sticky.value || incoming?.force) close(); });
function close() { isOpen.value = false; sticky.value = false; }
function onScroll() { if (!sticky.value) close(); }
watch(() => store.vaultSnapshot, close);
window.addEventListener('scroll', onScroll, true);
onScopeDispose(() => window.removeEventListener('scroll', onScroll, true));
</script>
<style scoped>
.desktop-insight { border: 1px solid #1f293733; border-radius: 4px; padding: 8px 24px; text-align: left; }
</style>
