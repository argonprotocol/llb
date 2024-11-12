<template>
  <div ref="elementRef" class="relative inline-block">
    
    <div v-if="props.type === 'number'" EditButton type="number" @click="openOverlay()" class="inline-block">
      {{ props.label || localModel }}
    </div>

    <div v-else-if="props.type === 'dollar'" EditButton type="dollar" @click="openOverlay()" class="inline-block">
      {{ props.label || `$${localModel}` }}
    </div>

    <div v-else-if="props.type === 'percent'" EditButton type="percent" @click="openOverlay()" class="inline-block">
      {{ props.label || `${localModel}%` }}
    </div>

    <DatePicker v-else-if="props.type === 'date'" @update:modelValue="updateModelValue" @popover-will-show="showingEditor()" @popover-will-hide="hidingEditor()" v-model="localModel" timezone="UTC" is-required>
      <template #default="{ togglePopover }">
        <div EditButton type="date" @click="togglePopover">
          {{ dayjs.utc(localModel).format('MMMM D, YYYY') }}
        </div>
      </template>
    </DatePicker>
  </div>
</template>

<script lang="ts" setup>
import * as Vue from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DatePicker } from '@angelblanco/v-calendar';
import emitter from '../emitters/basic';

import '@angelblanco/v-calendar/style.css';

dayjs.extend(utc);

const props = defineProps<{
  id: string;
  type: 'number' | 'date' | 'dollar' | 'percent';
  modelValue: string | number | Dayjs;
  label?: string;
}>();

const emit = defineEmits(['showing', 'hiding', 'updated', 'update:modelValue']);

const elementRef = Vue.ref<HTMLElement | null>(null);
const localModel = Vue.ref(props.modelValue);

Vue.watch(() => props.modelValue, (newValue) => {
  localModel.value = newValue;
});

function openOverlay() {
  const labelElem = elementRef.value?.querySelector(`[type="${props.type}"]`);
  if (!labelElem) return;

  labelElem.classList.add('showingOverlay');
  const buttonRect = labelElem.getBoundingClientRect();

  emitter.emit('showEditorOverlay', {
    id: props.id,
    type: props.type,
    left: buttonRect.left,
    top: buttonRect.top + buttonRect.height,
    arrowLeft: buttonRect.width / 2,
    value: props.modelValue,
  });
  showingEditor();
}

function hideOverlay(data: any) {
  if (data.isSaving) {
    updateModelValue(data.value);
  }
  hidingEditor();
}

function showingEditor() {
  elementRef.value?.querySelector(`[type="${props.type}"]`)?.classList.add('showingOverlay');
  emit('showing')
}

function hidingEditor() {
  elementRef.value?.querySelector(`[type="${props.type}"]`)?.classList.remove('showingOverlay');
  emit('hiding')
}

function updateModelValue(value: string | number | Dayjs) {
  if (props.type === 'number') {
    value = Number(value);
  }
  emit('update:modelValue', value);
  setTimeout(() => emit('updated', value), 0);
}

Vue.onMounted(() => {
  emitter.on('hideEditorOverlay', (data) => {
    if (data.id !== props.id) return;
    hideOverlay(data);
  });
});

Vue.onBeforeUnmount(() => {
  emitter.off('hideEditorOverlay', hideOverlay);
});

</script>

<style lang="scss" scoped>
  [EditButton] {
    @apply px-2 mx-0.5 text-sm py-0.5 bg-slate-400/20 hover:bg-slate-200/100 rounded border border-slate-400 font-mono cursor-pointer;
    box-shadow: inset 1px 1px 0 0 rgba(255, 255, 255, 0.75);
    &.showingOverlay {
      @apply bg-slate-400/40 hover:bg-slate-400/40;
      box-shadow: inset 1px 1px 1px 0 rgba(0, 0, 0, 0.15);
    }
  }
</style>