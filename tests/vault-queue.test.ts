import { expect, test, vi } from 'vitest';
import VaultQueue, { type VaultInputs, type VaultReply, type VaultRequest, type VaultWorkerPort } from '../src/lib/VaultQueue';
import VaultSnapshot from '../src/lib/VaultSnapshot';

const inputs: VaultInputs = { startingDate: '2020-10-02', endingDate: '2022-05-09', bitcoinCount: 1, ratchetPct: 10, shorts: [], usdTargetForArgon: 1.058, argonTargetUpdatedAt: '2026-09-12' };
function harness() {
  let frame: (() => void) | undefined;
  const worker: VaultWorkerPort = { onmessage: null, onerror: null, postMessage: vi.fn(), terminate: vi.fn() };
  const createWorker = vi.fn(() => worker);
  const complete = vi.fn();
  const state = vi.fn();
  const cancel = vi.fn(() => { frame = undefined; });
  const queue = new VaultQueue(createWorker, complete, state, { schedule: callback => { frame = callback; return 1; }, cancel });
  return { queue, worker, complete, state, createWorker, cancel,
    frame: () => { const callback = frame; frame = undefined; callback?.(); },
    reply: (reply: VaultReply) => worker.onmessage?.({ data: reply } as MessageEvent<VaultReply>),
    sent: () => vi.mocked(worker.postMessage).mock.calls.map(([request]) => request),
  };
}
test('marks scheduled changes pending immediately and coalesces to the newest input', () => {
  const h = harness();
  h.queue.add(inputs);
  const id = h.queue.add({ ...inputs, bitcoinCount: 4 });
  expect(h.state).toHaveBeenLastCalledWith('pending');
  expect(h.sent()).toHaveLength(0);
  h.frame();
  expect(h.sent()).toHaveLength(1);
  expect(h.sent()[0]).toMatchObject({ requestId: id, bitcoinCount: 4 });
});
test('ignores delayed and mismatched replies while retaining only the latest pending request', () => {
  const h = harness();
  const first = h.queue.add(inputs); h.frame();
  h.queue.add({ ...inputs, bitcoinCount: 2 });
  const latest = h.queue.add({ ...inputs, bitcoinCount: 3 });
  h.reply({ requestId: 999, snapshot: new VaultSnapshot() });
  h.reply({ requestId: first, snapshot: new VaultSnapshot() });
  expect(h.complete).not.toHaveBeenCalled();
  expect(h.state).toHaveBeenLastCalledWith('pending');
  h.frame();
  expect(h.sent().map(request => request.bitcoinCount)).toEqual([1, 3]);
  h.reply({ requestId: latest, snapshot: new VaultSnapshot() });
  expect(h.complete).toHaveBeenCalledOnce();
  expect(h.complete.mock.calls[0][0]).toMatchObject({ requestId: latest, isLoaded: true, inputs: { bitcoinCount: 3, startingDate: inputs.startingDate } });
  expect(h.state).toHaveBeenLastCalledWith('ready');
});
test('captures request inputs before the caller mutates a draft', () => {
  const h = harness();
  const request = { ...inputs, shorts: [{ date: '2021-01-01', lowestPrice: 0.5 }] };
  h.queue.add(request);
  request.shorts[0].lowestPrice = 0.9;
  h.frame();
  expect(h.sent()[0].shorts[0].lowestPrice).toBe(0.5);
});
test('reports calculation errors and can retry after a worker crash', () => {
  const h = harness();
  const first = h.queue.add(inputs); h.frame();
  h.reply({ requestId: first, error: 'Calculation failed' });
  expect(h.state).toHaveBeenLastCalledWith('error', 'Calculation failed');
  h.queue.add(inputs); h.frame();
  h.worker.onerror?.({} as ErrorEvent);
  expect(h.worker.terminate).toHaveBeenCalledOnce();
  expect(h.state.mock.calls.at(-1)?.[0]).toBe('error');
  const last = h.queue.add(inputs); h.frame();
  h.reply({ requestId: last, snapshot: new VaultSnapshot() });
  expect(h.createWorker).toHaveBeenCalledTimes(2);
  expect(h.state).toHaveBeenLastCalledWith('ready');
});
test('disposal cancels scheduled work and ignores late responses', () => {
  const h = harness();
  h.queue.add(inputs); h.queue.dispose(); h.frame();
  expect(h.cancel).toHaveBeenCalledOnce();
  expect(h.sent()).toHaveLength(0);
  const running = harness();
  const id = running.queue.add(inputs); running.frame(); running.queue.dispose();
  running.reply({ requestId: id, snapshot: new VaultSnapshot() });
  expect(running.worker.terminate).toHaveBeenCalledOnce();
  expect(running.complete).not.toHaveBeenCalled();
});
