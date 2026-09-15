import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import { writeFileSync } from 'node:fs';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('node:fs', () => ({ writeFileSync: vi.fn() }));

const point = (date: string, y: number) => ({ x: Date.parse(`${date}T00:00:00Z`) / 1000, y });
const originalExitCode = process.exitCode;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useFakeTimers();
  // The local calendar date can still be yesterday; generators must use UTC.
  vi.setSystemTime(new Date('2026-09-14T00:17:00Z'));
  process.exitCode = 0;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.exitCode = originalExitCode;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function prices(values: ReturnType<typeof point>[]) {
  vi.mocked(axios.get).mockResolvedValue({ data: { values } });
  await import('../generators/fetchBitcoinPrices.js');
}
async function fees(values: ReturnType<typeof point>[], counts = values.map(row => ({ ...row, y: 100 }))) {
  vi.mocked(axios.get).mockImplementation(async url => ({
    data: { values: String(url).endsWith('/n-transactions') ? counts : values },
  }));
  await import('../generators/fetchBitcoinFeesPerTransaction.js');
}
function writtenRows() {
  return JSON.parse(String(vi.mocked(writeFileSync).mock.calls[0][1]));
}

test('writes sorted completed UTC prices through yesterday and excludes today', async () => {
  await prices([point('2026-09-13', 120), point('2026-09-12', 100), point('2026-09-14', 130)]);
  expect(writtenRows().map((row: { date: string }) => row.date)).toEqual(['2026-09-12', '2026-09-13']);
  expect(process.exitCode).toBe(0);
});

test.each([
  [point('2026-09-12', 100)],
  [point('2026-09-11', 100), point('2026-09-13', 120)],
  [point('2026-09-13', 120), point('2026-09-13', 120)],
  [point('2026-09-12', 100), point('2026-09-13', 0)],
])('rejects stale, gapped, duplicate, or invalid prices without writing: %j', async (...values) => {
  await prices(values);
  expect(writeFileSync).not.toHaveBeenCalled();
  expect(process.exitCode).toBe(1);
});

test('fees match transaction counts by timestamp and preserve historical gaps', async () => {
  await fees(
    [point('2026-09-13', 2), point('2026-09-10', 1), point('2026-09-14', 3)],
    [point('2026-09-10', 100), point('2026-09-13', 200)],
  );
  expect(writtenRows()).toEqual([
    { date: '2026-09-10', feeInBitcoins: 0.01 },
    { date: '2026-09-13', feeInBitcoins: 0.01 },
  ]);
  expect(process.exitCode).toBe(0);
});

test.each([
  [point('2026-09-12', 2)],
  [point('2026-09-13', 2), point('2026-09-13', 2)],
])('rejects stale or duplicate fees without writing: %j', async (...values) => {
  await fees(values);
  expect(writeFileSync).not.toHaveBeenCalled();
  expect(process.exitCode).toBe(1);
});

test('rejects missing transaction counts without writing', async () => {
  await fees([point('2026-09-13', 2)], []);
  expect(writeFileSync).not.toHaveBeenCalled();
  expect(process.exitCode).toBe(1);
});

test('a network failure leaves the previous file intact', async () => {
  vi.mocked(axios.get).mockRejectedValue(new Error('Network unavailable'));
  await import('../generators/fetchBitcoinPrices.js');
  expect(writeFileSync).not.toHaveBeenCalled();
  expect(process.exitCode).toBe(1);
});
