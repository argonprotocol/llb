<template>
  <ChartOpaque :style="chartOpaqueStyle" class="absolute top-0 bottom-[47px] pointer-events-none" />
  <div SelectedLine :style="{ '--endpoint-x': pos + 'px', '--endpoint-top': (top || 20) + 'px', '--desktop-top': desktopTop + '%', zIndex: selected ? 4 : 3 }" :class="{ 'is-active': isActive }" class="slider-line absolute bottom-7 pointer-events-none" @pointerdown="down">
    <div class="selected-rail" />
    <button ref="handle" type="button" role="slider" :aria-label="position === 'left' ? 'Start date handle' : 'End date handle'" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="value" :aria-valuetext="valueText"
      class="nib-handle" :class="{ active: isActive }" @focus="emit('select')" @pointermove="move" @pointerup="up" @pointercancel="cancel" @lostpointercapture="cancel">
      <TriangleNib class="nib-outline w-6 h-6" /><TriangleNibBasic class="selected-nib" /><span v-if="selected" class="desktop:hidden absolute w-2 h-2 rounded-full bg-fuchsia-600 bottom-2" />
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref } from 'vue';
import TriangleNib from '../assets/triangle-nib.svg';
import TriangleNibBasic from '../assets/triangle-nib-basic.svg';
import ChartOpaque from './ChartOpaque.vue';
const props = defineProps<{ position: 'left' | 'right'; pos: number; top?: number; isActive: boolean; selected: boolean; min: number; max: number; value: number; valueText: string }>();
const emit = defineEmits<{ select: []; pointerdown: [event: PointerEvent]; pointermove: [event: PointerEvent]; pointerup: [event: PointerEvent]; pointercancel: [] }>();
const handle = ref<HTMLButtonElement | null>(null);
const desktopTop = computed(() => {
  const percent = props.pos / window.innerWidth * 100;
  return 80 - Math.max(0, Math.min(1, (percent - 40) / 30)) * 60;
});
let pointer: number | null = null;
const chartOpaqueStyle = computed(() => props.position === 'left'
  ? { width: Math.max(0, props.pos - 10) + 'px', left: '10px' }
  : { left: props.pos + 'px', right: '10px' });
function down(event: PointerEvent) {
  if (pointer !== null || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
  pointer = event.pointerId;
  handle.value?.focus({ preventScroll: true });
  handle.value?.setPointerCapture(event.pointerId);
  emit('pointerdown', event);
}
function move(event: PointerEvent) { if (event.pointerId === pointer) emit('pointermove', event); }
function release() {
  const id = pointer;
  pointer = null;
  if (id !== null && handle.value?.hasPointerCapture(id)) handle.value.releasePointerCapture(id);
}
function up(event: PointerEvent) {
  if (event.pointerId !== pointer) return;
  emit('pointerup', event);
  release();
}
function cancel() { if (pointer !== null) { release(); emit('pointercancel'); } }
function escape(event: KeyboardEvent) { if (event.key === 'Escape') cancel(); }
onMounted(() => { window.addEventListener('resize', cancel); window.addEventListener('keydown', escape); });
onScopeDispose(() => { cancel(); window.removeEventListener('resize', cancel); window.removeEventListener('keydown', escape); });
</script>
<style scoped>
.slider-line { top: var(--endpoint-top); bottom: 18px; left: clamp(8px, calc(var(--endpoint-x) - 4px), calc(100% - 16px)); width: 8px; }
.slider-line::before { content: ''; position: absolute; inset: 0; border-radius: 4px; background: #ffffffcc; box-shadow: inset 0 0 0 1px #94a3b899, 1px 0 4px #0000001a; mask-image: linear-gradient(to bottom, transparent, black 50px); }
.selected-rail, .selected-nib { display: none; }
.nib-handle { position: absolute; top: 0; bottom: -22px; left: -8px; display: flex; align-items: flex-end; justify-content: center; width: 24px; padding-bottom: 10px; pointer-events: auto; touch-action: pan-y pinch-zoom; cursor: grab; border-radius: .3rem; }
.nib-handle.active { background: linear-gradient(to bottom, transparent, #f0abfc22 50px); }
.nib-handle:focus-visible { outline: none; }
@screen desktop {
  .slider-line { left: var(--endpoint-x); border-radius: 0; }
  .slider-line { top: min(var(--desktop-top), var(--endpoint-top)); bottom: 12px; width: 4px; background: linear-gradient(to bottom, #fff0, #fff 50px); box-shadow: 1px 0 4px #0000001a; pointer-events: auto; touch-action: pan-y pinch-zoom; cursor: col-resize; user-select: none; }
  .slider-line::before, .slider-line::after { content: ''; position: absolute; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #1e293b00, #1e293b66 50px); }
  .slider-line::before { left: -2px; right: auto; border-radius: 0; box-shadow: none; mask-image: none; }
  .slider-line::after { right: -2px; }
  .nib-handle { top: auto; left: -19.5px; bottom: -12px; width: 44px; height: 44px; z-index: 1; align-items: flex-end; padding-bottom: 2px; }
  .nib-handle.active { background: transparent; }
  .nib-handle:focus-visible { outline: 2px solid #a21caf; }
  .nib-outline { width: 24.5px; height: 24px; }
  .is-active .selected-rail { display: block; position: absolute; left: 1px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #cc88ff00, #c8f 50px); }
  .is-active .selected-nib { display: block; position: absolute; left: 12px; bottom: 6px; width: 18px; height: 16px; }
}
</style>
