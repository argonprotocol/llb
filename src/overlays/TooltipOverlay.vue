<template>
  <DesktopPopover v-if="desktop" :open="isOpen" :anchor="anchor" :anchor-key="label" :label="label" placement="bottom-end" width="max-content" :gap="7" :interactive="false">
    <div class="desktop-control-tooltip">{{ label }}</div>
  </DesktopPopover>
</template>
<script setup lang="ts">
import { onMounted, onScopeDispose, ref, shallowRef } from 'vue';
import DesktopPopover from '../components/DesktopPopover.vue';
import { useEvent } from '../lib/EventUtils';
import { useDesktopLayout } from '../lib/ResponsiveLayout';
const desktop = useDesktopLayout();
const isOpen = ref(false);
const label = ref('');
const source = shallowRef<HTMLElement | null>(null);
const anchor = () => source.value;
function close() { isOpen.value = false; }
useEvent<{ label: string; anchor: HTMLElement }>('showTooltip', incoming => {
  label.value = incoming.label; source.value = incoming.anchor; isOpen.value = true;
});
useEvent('hideTooltip', close);
function escape(event: KeyboardEvent) { if (event.key === 'Escape') close(); }
onMounted(() => { window.addEventListener('scroll', close, true); window.addEventListener('resize', close); window.addEventListener('keydown', escape); document.addEventListener('pointerdown', close, true); });
onScopeDispose(() => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); window.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', close, true); });
</script>
<style scoped>
.desktop-control-tooltip { padding: 8px 12px; border: 1px solid #1f293733; border-radius: 4px; font-size: 14px; line-height: 20px; font-weight: 300; color: #64748b; white-space: nowrap; }
</style>
