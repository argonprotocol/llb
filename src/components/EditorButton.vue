<template>
  <span class="EditorButton Component">
    <button type="button" :id="field + '-trigger'" @click="editor.open(field)" class="editor-trigger" :class="{ 'desktop-editor': desktop, 'showing-editor': editor.field === field }" :aria-label="'Edit ' + editorLabels[field]" aria-haspopup="dialog" :aria-expanded="editor.field === field" :aria-controls="desktop && editor.field === field ? 'scenario-editor' : undefined">
      {{ label || (isDate ? dayjs.utc(value).format(desktop ? 'MMMM D, YYYY' : 'MMM D, YYYY') : field === 'ratchetPct' ? value + '%' : value) }}
    </button>
  </span>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import { editorLabels, useScenarioEditor, type EditorField } from '../lib/ScenarioEditor';
const props = defineProps<{ field: EditorField; desktop?: boolean; label?: string }>();
const editor = useScenarioEditor();
const value = computed(() => editor.valueFor(props.field));
const isDate = computed(() => props.field === 'dateLeft' || props.field === 'dateRight');
</script>
<style scoped>
.desktop-editor { min-height: 0; padding: 2px 8px; margin: 0 2px; font-size: 14px; line-height: 20px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; text-transform: uppercase; color: black; background: #94a3b833; border: 1px solid #94a3b8; border-radius: 4px; box-shadow: inset 1px 1px 0 #ffffffbf; }
.desktop-editor:hover { background: #e2e8f0; }
.desktop-editor.showing-editor { background: #94a3b866; box-shadow: inset 1px 1px 1px #00000026; }
</style>
