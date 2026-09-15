import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import { useBasicStore } from '../store';
import { dateOnly, normalizeNumber } from './ScenarioConfig';

export type EditorField = 'bitcoinCount' | 'ratchetPct' | 'dateLeft' | 'dateRight';
export const editorLabels: Record<EditorField, string> = {
  bitcoinCount: 'Bitcoin quantity', ratchetPct: 'Ratchet threshold', dateLeft: 'Start date', dateRight: 'Exit date',
};

// The session outlives either presentation. Only Save/date selection commits a scenario.
export const useScenarioEditor = defineStore('scenarioEditor', () => {
  const store = useBasicStore();
  const field = ref<EditorField | null>(null);
  const draft = ref('');
  const error = ref('');
  const calendarPage = ref<{ year: number; month: number }>();
  const title = computed(() => field.value ? editorLabels[field.value] : 'Edit scenario');
  const isDate = computed(() => field.value === 'dateLeft' || field.value === 'dateRight');
  const bounds = computed(() => isDate.value
    ? store.dateDomain.bounds(field.value === 'dateLeft' ? 'left' : 'right', store.sliderDates)
    : undefined);
  const calendarValue = computed(() => isDate.value ? dayjs.utc(draft.value).toDate() : null);

  function valueFor(key: EditorField) {
    return key === 'dateLeft' ? store.sliderDates.left : key === 'dateRight' ? store.sliderDates.right : store[key];
  }
  function open(key: EditorField) {
    if (field.value === key) { close(); return; }
    draft.value = String(valueFor(key)); error.value = ''; field.value = key;
    calendarPage.value = isDate.value ? { year: dayjs.utc(draft.value).year(), month: dayjs.utc(draft.value).month() + 1 } : undefined;
  }
  function rememberCalendarPage(pages: { year: number; month: number }[]) {
    if (pages[0]) calendarPage.value = { year: pages[0].year, month: pages[0].month };
  }
  function adjustDraft(delta: number) {
    const key = field.value;
    if (key !== 'bitcoinCount' && key !== 'ratchetPct') return;
    try { draft.value = String(normalizeNumber(Number(draft.value || 0) + delta, key)); error.value = ''; }
    catch (exception) { error.value = (exception as Error).message; }
  }
  function close() { field.value = null; draft.value = ''; error.value = ''; }
  function save() {
    const key = field.value;
    if (key !== 'bitcoinCount' && key !== 'ratchetPct') return;
    try { store.commitScenario({ [key]: normalizeNumber(draft.value, key) }); close(); }
    catch (exception) { error.value = (exception as Error).message; }
  }
  function selectDate(value: unknown) {
    if (!isDate.value) return;
    const date = dateOnly(value);
    if (!date || !bounds.value || date < bounds.value.min || date > bounds.value.max) {
      error.value = 'Choose a date within the allowed range.';
      return;
    }
    try {
      store.commitScenario({ sliderDates: { ...store.sliderDates, [field.value === 'dateLeft' ? 'left' : 'right']: date } });
      close();
    } catch (exception) { error.value = (exception as Error).message; }
  }
  return { field, draft, error, title, isDate, bounds, calendarValue, calendarPage, rememberCalendarPage, adjustDraft, valueFor, open, close, save, selectDate };
});
