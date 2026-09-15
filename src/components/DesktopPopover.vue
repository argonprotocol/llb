<template>
  <Teleport to="body">
    <div v-if="open" ref="panel" :id="id" :role="interactive ? 'dialog' : 'tooltip'" :aria-label="label" :aria-modal="interactive ? 'false' : undefined" tabindex="-1"
      class="desktop-popover" :class="{ passive: !interactive, 'small-arrow': smallArrow }" :style="{ width: panelWidth, maxHeight: maxHeight + 'px', visibility: positioned ? 'visible' : 'hidden' }">
      <div class="popover-arrow" aria-hidden="true"><svg viewBox="0 0 24 12"><path d="M0 12L12 0L24 12" /></svg></div>
      <div class="popover-content"><slot /></div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { nextTick, onScopeDispose, ref, watch } from 'vue';
import { createPopper, type Instance, type Placement } from '@popperjs/core';
const props = withDefaults(defineProps<{
  open: boolean; anchor: () => HTMLElement | null; anchorKey?: string | null; id?: string; label: string;
  placement?: Placement; width?: string; gap?: number; interactive?: boolean; focusOnOpen?: boolean;
  alignment?: () => HTMLElement | null; matchAlignmentWidth?: boolean; fitAbove?: boolean;
  smallArrow?: boolean; skid?: number; arrowOffset?: number;
}>(), { placement: 'bottom-start', width: '300px', gap: 12, interactive: true, focusOnOpen: false });
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);
const panelWidth = ref(props.width);
const maxHeight = ref(0);
const positioned = ref(false);
let popper: Instance | undefined;
let observer: ResizeObserver | undefined;
let generation = 0;
function measure() {
  const anchor = props.anchor();
  if (!anchor || !panel.value) return;
  const rect = anchor.getBoundingClientRect();
  maxHeight.value = props.fitAbove ? Math.max(120, rect.top - 25) : window.innerHeight - 16;
  panelWidth.value = props.matchAlignmentWidth && props.alignment?.()
    ? props.alignment()!.getBoundingClientRect().width + 3 + 'px' : props.width;
  void nextTick(() => popper?.update());
}
function outside(event: Event) {
  if (!props.interactive || !props.open) return;
  const target = event.target as Node;
  if (panel.value?.contains(target) || props.anchor()?.contains(target)) return;
  emit('close');
}
function escape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.open || !props.interactive) return;
  event.preventDefault(); event.stopPropagation();
  const anchor = props.anchor();
  emit('close');
  void nextTick(() => anchor?.isConnected && anchor.focus({ preventScroll: true }));
}
function stop() {
  popper?.destroy(); popper = undefined; observer?.disconnect(); observer = undefined;
  document.removeEventListener('pointerdown', outside, true);
  document.removeEventListener('focusin', outside);
  document.removeEventListener('keydown', escape);
  window.removeEventListener('resize', measure);
  window.removeEventListener('scroll', measure, true);
}
watch(() => [props.open, props.anchorKey, props.interactive, props.width], async () => {
  const run = ++generation;
  stop(); positioned.value = false;
  if (!props.open) return;
  await nextTick();
  if (run !== generation || !panel.value) return;
  const anchor = props.anchor();
  if (!anchor) return;
  measure();
  await nextTick();
  if (run !== generation || !panel.value) return;
  const reference = {
    contextElement: anchor,
    getBoundingClientRect: () => {
      const rect = anchor.getBoundingClientRect();
      const alignment = props.alignment?.()?.getBoundingClientRect();
      return alignment ? new DOMRect(alignment.left, rect.top, alignment.width, rect.height) : rect;
    },
  };
  popper = createPopper(reference, panel.value, {
    strategy: 'fixed', placement: props.placement,
    modifiers: [
      { name: 'computeStyles', options: { roundOffsets: false } },
      { name: 'offset', options: { offset: [props.skid || 0, props.gap] } },
      { name: 'flip', options: { padding: 8 } },
      { name: 'preventOverflow', options: { padding: 8 } },
      { name: 'sourceArrow', enabled: true, phase: 'afterWrite', fn: ({ state }) => {
        const source = anchor.getBoundingClientRect();
        const box = state.elements.popper.getBoundingClientRect();
        const vertical = state.placement.startsWith('top') || state.placement.startsWith('bottom');
        const offset = props.arrowOffset ?? (vertical ? source.left + source.width / 2 - box.left : source.top + source.height / 2 - box.top);
        state.elements.popper.style.setProperty('--arrow-offset', Math.max(12, Math.min(offset, (vertical ? box.width : box.height) - 12)) + 'px');
      } },
    ],
  });
  await popper.update();
  if (run !== generation) return;
  positioned.value = true;
  await nextTick();
  if (run !== generation || !panel.value) return;
  observer = new ResizeObserver(measure); observer.observe(panel.value); observer.observe(anchor);
  window.addEventListener('resize', measure); window.addEventListener('scroll', measure, true);
  // Focus before subscribing so opening a popover never dismisses itself.
  if (props.focusOnOpen) (panel.value.querySelector<HTMLElement>('input, [tabindex="0"], button') || panel.value).focus({ preventScroll: true });
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('focusin', outside);
  document.addEventListener('keydown', escape);
}, { immediate: true, flush: 'post' });
onScopeDispose(() => { generation++; stop(); });
</script>
<style scoped>
.desktop-popover { position: fixed; z-index: 3100; max-width: calc(100vw - 16px); display: flex; flex-direction: column; background: white; border-radius: 6px; box-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a, 0 0 0 1px #1118270d; color: #111827; }
.popover-content { overflow: auto; min-height: 0; border-radius: inherit; }
.passive { pointer-events: none; }
.popover-arrow { position: absolute; width: 24px; height: 12px; pointer-events: none; }
.popover-arrow svg { width: 24px; height: 12px; fill: white; stroke: #1118271a; stroke-width: 1; }
.small-arrow .popover-arrow, .small-arrow .popover-arrow svg { width: 17px; height: 11px; }
[data-popper-placement^=bottom] .popover-arrow { top: -11px; left: var(--arrow-offset); transform: translateX(-50%); }
[data-popper-placement^=top] .popover-arrow { bottom: -11px; left: var(--arrow-offset); transform: translateX(-50%) rotate(180deg); }
[data-popper-placement^=right] .popover-arrow { left: -17px; top: var(--arrow-offset); transform: translateY(-50%) rotate(-90deg); }
[data-popper-placement^=left] .popover-arrow { right: -17px; top: var(--arrow-offset); transform: translateY(-50%) rotate(90deg); }
</style>
