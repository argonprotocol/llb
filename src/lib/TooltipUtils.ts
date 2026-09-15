import emitter from '../emitters/basic';
export function showTooltip(event: Event, label: string) {
  const anchor = event.currentTarget as HTMLElement | null;
  if (anchor) emitter.emit('showTooltip', { label, anchor });
}
export function hideTooltip() { emitter.emit('hideTooltip'); }
