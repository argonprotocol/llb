<template>
  <div id="date-controls" ref="elementRef" tabindex="-1" class="date-controls">
    <div class="endpoint-grid">
      <template v-for="side in sides" :key="side">
        <span v-if="side === 'right'" class="endpoint-separator">to</span>
        <div class="endpoint-field">
          <EditorButton :field="side === 'left' ? 'dateLeft' : 'dateRight'" :class="{ 'endpoint-selected': selected === side }" @click="$emit('select', side)" @keydown="$emit('key', $event, side)" />
          <span class="endpoint-price">{{ side === 'left' ? 'Bought' : 'Exited' }} at ${{ currency(store.bitcoinPrices.prices[store.sliderIndexes[side]].price) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useBasicStore } from '../store';
import { currency } from '../lib/BasicUtils';
import { type Side } from '../lib/ScenarioConfig';
import EditorButton from './EditorButton.vue';
defineProps<{ selected: Side }>();
defineEmits<{ select: [side: Side]; key: [event: KeyboardEvent, side: Side] }>();
const store = useBasicStore();
const sides: Side[] = ['left', 'right'];
const elementRef = ref<HTMLElement | null>(null);
defineExpose({ elementRef });
</script>
<style scoped>
.endpoint-grid { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: .5rem; }
.endpoint-separator { display: flex; align-items: center; height: 44px; color: #64748b; }
.endpoint-field { display: grid; min-width: 0; gap: .25rem; }
.endpoint-field :deep(.editor-trigger) { width: 100%; padding-left: .75rem; padding-right: .25rem; }
.endpoint-selected :deep(.editor-trigger) { color: #86198f; background: #fae8ff; border-color: #c026d3; }
.endpoint-price { font-size: .8rem; color: #64748b; overflow-wrap: anywhere; }
</style>
