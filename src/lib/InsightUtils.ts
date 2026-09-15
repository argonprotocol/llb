import emitter from '../emitters/basic';
export function showInsight(event: Event, data: Record<string, any> = {}, isSticky = false) {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  emitter.emit('showInsight', { id: target.getAttribute('insightId') || '', anchor: target, data, isSticky });
}
export function hideInsight(force = false) { emitter.emit('hideInsight', { force }); }
