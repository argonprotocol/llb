import { onScopeDispose } from 'vue';
import emitter from '../emitters/basic';

export function useEvent<T = unknown>(name: string, handler: (data: T) => void) {
  const listener = (data: unknown) => handler(data as T);
  emitter.on(name, listener);
  onScopeDispose(() => emitter.off(name, listener));
}
