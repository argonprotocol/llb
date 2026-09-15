<template>
  <component :is="desktop ? DesktopPopover : MobileSheet" :open="editor.field !== null" v-bind="surfaceProps" @close="editor.close">
    <ScenarioEditorFields :desktop="desktop" />
  </component>
</template>
<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import MobileSheet from './MobileSheet.vue';
import DesktopPopover from './DesktopPopover.vue';
import ScenarioEditorFields from './ScenarioEditorFields.vue';
import { useScenarioEditor } from '../lib/ScenarioEditor';
import { useDesktopLayout } from '../lib/ResponsiveLayout';
import { hideInsight } from '../lib/InsightUtils';
const editor = useScenarioEditor();
const desktop = useDesktopLayout();
const anchor = () => document.getElementById(editor.field + '-trigger');
const surfaceProps = computed(() => desktop.value
  ? { id: 'scenario-editor', anchor, anchorKey: editor.field, label: editor.title, width: editor.isDate ? '252px' : '300px', gap: editor.isDate ? 10 : 12, skid: editor.isDate ? 0 : -2, arrowOffset: editor.isDate ? undefined : 16, smallArrow: !editor.isDate, focusOnOpen: true }
  : { title: editor.title, maxWidth: '24rem' });
watch(() => editor.field, async (field, previous) => {
  if (field) { hideInsight(true); return; }
  if (!previous) return;
  await nextTick();
  document.getElementById(previous + '-trigger')?.focus({ preventScroll: true });
});
</script>
