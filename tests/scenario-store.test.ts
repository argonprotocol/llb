import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { effectScope } from 'vue';
import dayjs from 'dayjs';
import { useBasicStore } from '../src/store';
import { useScenarioEditor } from '../src/lib/ScenarioEditor';
import VaultSnapshot from '../src/lib/VaultSnapshot';
import type { VaultReply, VaultRequest, VaultWorkerPort } from '../src/lib/VaultQueue';

const mock = vi.hoisted(() => ({ workers: [] as VaultWorkerPort[], requests: [] as VaultRequest[], exports: [] as VaultSnapshot[] }));
vi.mock('../src/workers/worker.ts?worker', () => ({ default: class {
  onmessage = null; onerror = null;
  constructor() { mock.workers.push(this); }
  postMessage(request: VaultRequest) { mock.requests.push(request); }
  terminate() {}
} }));
vi.mock('../src/lib/Download', () => ({ default: class {
  constructor(snapshot: VaultSnapshot) { mock.exports.push(snapshot); }
  run() { return Promise.resolve(); }
} }));
let frames: Map<number, FrameRequestCallback>;
let storage: Map<string, string>;
let store: ReturnType<typeof useBasicStore>;
function frame() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(0)); }
function reply(error?: string) {
  const request = mock.requests.at(-1)!;
  const snapshot = Object.assign(new VaultSnapshot(), { bitcoinCount: request.bitcoinCount, totalAccruedValue: 12345 });
  mock.workers.at(-1)!.onmessage?.({ data: { requestId: request.requestId, snapshot: error ? undefined : snapshot, error } } as MessageEvent<VaultReply>);
}
beforeEach(() => {
  mock.workers.length = 0; mock.requests.length = 0; mock.exports.length = 0;
  frames = new Map(); storage = new Map(); let id = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++id, callback); return id; });
  vi.stubGlobal('cancelAnimationFrame', (frameId: number) => frames.delete(frameId));
  vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal('sessionStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
  setActivePinia(createPinia());
  store = useBasicStore();
});
afterEach(() => { store.$dispose(); vi.unstubAllGlobals(); });
test('export guards idle, initial load, scheduled edits, pending work and errors', async () => {
  store.downloadRawData(); expect(mock.exports).toHaveLength(0);
  await store.loadData(); store.downloadRawData(); expect(mock.exports).toHaveLength(0);
  frame(); reply(); expect(store.canExport).toBe(true);
  store.commitScenario({ bitcoinCount: 4 });
  expect(store.calculationState).toBe('pending');
  store.downloadRawData(); expect(mock.exports).toHaveLength(0);
  expect(store.vaultSnapshot.inputs?.bitcoinCount).toBe(1);
  frame(); reply('failed'); store.downloadRawData(); expect(mock.exports).toHaveLength(0);
  store.runVault(); frame(); reply();
  await store.downloadRawData(); expect(mock.exports).toHaveLength(1);
  expect(mock.exports[0].inputs?.bitcoinCount).toBe(4);
});
test('an export captures a detached completed snapshot and does not change during later edits', async () => {
  await store.loadData(); frame(); reply(); await store.downloadRawData();
  const exported = mock.exports[0];
  expect(exported).not.toBe(store.vaultSnapshot);
  store.commitScenario({ bitcoinCount: 10 }); frame(); reply();
  expect(store.vaultSnapshot.bitcoinCount).toBe(10);
  expect(exported.bitcoinCount).toBe(1);
  expect(exported.inputs?.bitcoinCount).toBe(1);
});
test('invalid commits do not calculate and inactive saved drops are retained and reactivated', async () => {
  store.commitScenario({ sliderDates: { left: '2020-10-02', right: '2022-05-09' } });
  await store.loadData(); frame(); reply();
  expect(() => store.commitScenario({ bitcoinCount: NaN })).toThrow();
  expect(mock.requests).toHaveLength(1);
  store.addPriceDrop('2021-01-01', 0.5); frame(); reply();
  expect(store.activeShorts).toHaveLength(1);
  store.commitScenario({ sliderDates: { left: '2021-02-01', right: '2022-05-09' }, ratchetPct: 0 }); frame(); reply();
  expect(store.shorts).toHaveLength(1); expect(store.activeShorts).toHaveLength(0);
  expect(mock.requests.at(-1)?.shorts).toEqual([]);
  expect(JSON.parse(storage.get('config')!).ratchetPct).toBe(0);
  expect(JSON.parse(storage.get('config')!)).not.toHaveProperty('requestId');
  store.commitScenario({ sliderDates: { left: '2020-10-02', right: '2022-05-09' } }); frame(); reply();
  expect(store.activeShorts).toHaveLength(1);
});

test('an editor session survives presentation disposal without committing its draft', async () => {
  await store.loadData(); frame(); reply();
  const desktopScope = effectScope();
  const desktopEditor = desktopScope.run(() => useScenarioEditor())!;
  desktopEditor.open('bitcoinCount');
  desktopEditor.draft = '3.6';
  desktopScope.stop();
  const mobileScope = effectScope();
  const mobileEditor = mobileScope.run(() => useScenarioEditor())!;
  expect(mobileEditor).toBe(desktopEditor);
  expect(mobileEditor.field).toBe('bitcoinCount');
  expect(mobileEditor.draft).toBe('3.6');
  expect(store.bitcoinCount).toBe(1);
  expect(mock.requests).toHaveLength(1);
  mobileEditor.save(); frame();
  expect(store.bitcoinCount).toBe(4);
  expect(mock.requests).toHaveLength(2);
  expect(mock.requests.at(-1)?.bitcoinCount).toBe(4);
  expect(mobileEditor.field).toBeNull();
  mobileScope.stop();
});

test('invalid and cancelled editor drafts preserve the committed scenario', async () => {
  await store.loadData(); frame(); reply();
  const editor = useScenarioEditor();
  editor.open('ratchetPct'); editor.draft = ''; editor.save();
  expect(editor.error).toBeTruthy();
  expect(editor.field).toBe('ratchetPct');
  expect(store.ratchetPct).toBe(10);
  editor.close();
  editor.open('bitcoinCount'); editor.draft = '5'; editor.close();
  expect(store.bitcoinCount).toBe(1);
  expect(mock.requests).toHaveLength(1);
  editor.open('ratchetPct');
  expect(editor.draft).toBe('10');
  expect(editor.error).toBe('');
  editor.draft = '0'; editor.save(); frame();
  expect(store.ratchetPct).toBe(0);
  expect(mock.requests.at(-1)?.ratchetPct).toBe(0);
});

test('date editors use current bounds and commit only their selected endpoint', async () => {
  store.commitScenario({ sliderDates: { left: '2020-10-02', right: '2022-05-09' } });
  await store.loadData(); frame(); reply();
  const editor = useScenarioEditor();
  editor.open('dateRight');
  store.commitScenario({ sliderDates: { ...store.sliderDates, left: '2021-01-01' } }); frame(); reply();
  editor.selectDate('2021-04-02');
  expect(editor.error).toBeTruthy();
  expect(editor.field).toBe('dateRight');
  expect(store.sliderDates.right).toBe('2022-05-09');
  expect(mock.requests).toHaveLength(2);
  editor.selectDate(new Date('2021-07-01T00:00:00.000Z')); frame();
  expect(store.sliderDates).toEqual({ left: '2021-01-01', right: '2021-07-01' });
  expect(editor.field).toBeNull();
  expect(mock.requests).toHaveLength(3);
});

test('the latest dataset date can be selected, calculated, persisted, and exported', async () => {
  store.commitScenario({ sliderDates: { left: '2020-10-02', right: '2022-05-09' } });
  await store.loadData(); frame(); reply();
  const editor = useScenarioEditor();
  const last = store.bitcoinPrices.prices[store.bitcoinPrices.prices.length - 1];
  editor.open('dateRight');
  expect(editor.bounds?.max).toBe(last.date);
  editor.selectDate(last.date); frame();
  expect(store.sliderDates.right).toBe(last.date);
  expect(store.sliderDates.left).toBe('2020-10-02');
  expect(store.sliderIndexes.right).toBe(store.bitcoinPrices.prices.length - 1);
  expect(mock.requests.at(-1)?.endingDate).toBe(last.date);
  expect(JSON.parse(storage.get('config')!).sliderDates.right).toBe(last.date);
  reply(); await store.downloadRawData();
  expect(mock.exports[0].inputs?.endingDate).toBe(last.date);
  store.$dispose();
  setActivePinia(createPinia()); store = useBasicStore();
  expect(store.sliderDates.right).toBe(last.date);
  expect(store.sliderDates.left).toBe('2020-10-02');
});

test('calendar navigation survives presentation disposal without committing a date', async () => {
  store.commitScenario({ sliderDates: { left: '2020-10-02', right: '2022-05-09' } });
  await store.loadData(); frame(); reply();
  const desktopScope = effectScope();
  const editor = desktopScope.run(() => useScenarioEditor())!;
  editor.open('dateLeft');
  editor.rememberCalendarPage([{ year: 2019, month: 7 }]);
  desktopScope.stop();
  const mobileEditor = useScenarioEditor();
  expect(mobileEditor.calendarPage).toEqual({ year: 2019, month: 7 });
  expect(mobileEditor.draft).toBe('2020-10-02');
  expect(store.sliderDates.left).toBe('2020-10-02');
  expect(mock.requests).toHaveLength(1);
  mobileEditor.open('dateLeft'); // Clicking the active trigger cancels the editor.
  expect(mobileEditor.field).toBeNull();
  mobileEditor.open('dateRight');
  expect(mobileEditor.calendarPage).toEqual({ year: 2022, month: 5 });
});

test('numeric arrow keys adjust only the draft and respect scenario bounds', async () => {
  await store.loadData(); frame(); reply();
  const editor = useScenarioEditor();
  editor.open('bitcoinCount'); editor.adjustDraft(-1);
  expect(editor.draft).toBe('1');
  editor.adjustDraft(1); expect(editor.draft).toBe('2');
  expect(store.bitcoinCount).toBe(1);
  editor.open('ratchetPct'); editor.draft = '100'; editor.adjustDraft(1);
  expect(editor.draft).toBe('100');
  editor.draft = '0'; editor.adjustDraft(-1);
  expect(editor.draft).toBe('0');
  expect(store.ratchetPct).toBe(10);
  expect(mock.requests).toHaveLength(1);
});

test('first load selects and calculates the latest available year', async () => {
  const right = store.dateDomain.last;
  const left = dayjs.utc(right).subtract(1, 'year').format('YYYY-MM-DD');
  expect(store.sliderDates).toEqual({ left, right });
  expect(store.sliderIndexes.right).toBe(store.bitcoinPrices.prices.length - 1);
  await store.loadData(); frame();
  expect(mock.requests.at(-1)).toMatchObject({ startingDate: left, endingDate: right });
});

test('reset followed by reload restores the latest year even with a pending saved edit', async () => {
  await store.loadData(); frame(); reply();
  store.commitScenario({ sliderDates: { left: '2020-10-02', right: '2022-05-09' }, bitcoinCount: 4 });
  store.resetConfig();
  store.$dispose();
  expect(storage.has('config')).toBe(false);
  setActivePinia(createPinia()); store = useBasicStore();
  const right = store.dateDomain.last;
  const left = dayjs.utc(right).subtract(1, 'year').format('YYYY-MM-DD');
  expect(store.sliderDates).toEqual({ left, right });
  expect(store.bitcoinCount).toBe(1);
  await store.loadData(); frame();
  expect(mock.requests.at(-1)).toMatchObject({ startingDate: left, endingDate: right });
  expect(JSON.parse(storage.get('config')!).sliderDates).toEqual({ left, right });
});
