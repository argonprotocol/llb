import { onMounted, onScopeDispose, ref } from 'vue';
import layout from './ResponsiveLayout.json';

export const DESKTOP_QUERY = `(min-width: ${layout.desktop}px)`;
export function useDesktopLayout() {
  const query = window.matchMedia(DESKTOP_QUERY);
  const desktop = ref(query.matches);
  const update = () => { desktop.value = query.matches; };
  onMounted(() => query.addEventListener('change', update));
  onScopeDispose(() => query.removeEventListener('change', update));
  return desktop;
}
export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  element?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  element?.focus({ preventScroll: true });
}
