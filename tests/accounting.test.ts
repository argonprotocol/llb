import { expect, test } from 'vitest';
import BitcoinFees from '../src/lib/BitcoinFees';
import BitcoinPrices from '../src/lib/BitcoinPrices';
import Download from '../src/lib/Download';
import Vault, { type IClonableShort } from '../src/lib/Vault';
import VaultSnapshot from '../src/lib/VaultSnapshot';

function simulate(prices: number[], bitcoinCount = 1, ratchetPct = 0, shorts: IClonableShort[] = [], fee = 1) {
  const bitcoinPrices = new BitcoinPrices();
  bitcoinPrices.prices = prices.map((price, index) => ({ date: `2024-01-0${index + 1}`, price }));
  bitcoinPrices.indexByDate = Object.fromEntries(bitcoinPrices.prices.map(({ date }, index) => [date, index]));
  const bitcoinFees = new BitcoinFees();
  bitcoinFees.getByDate = () => fee;
  const vault = new Vault('2024-01-01', `2024-01-0${prices.length}`, ratchetPct, shorts, bitcoinPrices, bitcoinFees, bitcoinCount);
  const snapshot = new VaultSnapshot();
  snapshot.update(vault);
  // Match the plain snapshot delivered by the worker.
  const download = new Download(structuredClone(snapshot));
  return { vault, snapshot, download, rows: download.generateData() };
}

for (const bitcoinCount of [1, 2, 10]) {
  test(`export scales intermediate values and net returns for ${bitcoinCount} BTC`, () => {
    const { rows, snapshot, download } = simulate([100, 110, 120], bitcoinCount);
    expect(snapshot.bitcoinCount).toBe(bitcoinCount);
    expect(rows.map(row => row.totalAccruedValue)).toEqual([
      100 * bitcoinCount - 2,
      110 * bitcoinCount - 2,
      120 * bitcoinCount - 4,
    ]);
    expect(rows[0].hodlerReturn).toBeCloseTo(-2 / (100 * bitcoinCount));
    expect(rows[1].hodlerReturn).toBeCloseTo((10 * bitcoinCount - 2) / (100 * bitcoinCount));
    expect(rows[2].vaulterReturn).toBeCloseTo(snapshot.vaulterProfit);
    expect(rows[2].hodlerReturn).toBeCloseTo(snapshot.hodlerProfit);
    const csv = download.generateCSV(rows).split('\n');
    expect(Number(csv[3].split(',').at(-2))).toBeCloseTo((20 * bitcoinCount - 4) / (100 * bitcoinCount));
  });
}

test('initial-lock profit excludes expenses for flat, rising, and falling prices', () => {
  for (const [endingPrice, protection, finalValue] of [[100, 0, 196], [120, 0, 236], [80, 40, 196]]) {
    const { snapshot } = simulate([100, endingPrice], 2);
    expect(snapshot.profitFromInitialLock).toBe(protection);
    expect(snapshot.totalAccruedValue).toBe(finalValue);
  }
});

test('export retains a zero final value', () => {
  const { rows, snapshot } = simulate([2, 3, 1], 1, 0, [], 0.5);
  expect(snapshot.totalAccruedValue).toBe(0);
  expect(rows[2].totalAccruedValue).toBe(0);
  expect(rows[2].vaulterReturn).toBe(-1);
});

test('export retains a zero accrued cash balance on an action', () => {
  const { snapshot } = simulate([100, 110, 120]);
  snapshot.actions[1].totalCashUnlocked = 0;
  expect(new Download(snapshot).generateData()[2].totalCashUnlocked).toBe(0);
});

test('export matches net engine returns with ratchets and a price drop', () => {
  const { snapshot, rows } = simulate([100, 120, 80, 100], 2, 10, [{ date: '2024-01-03', lowestPrice: 0.5 }]);
  expect(snapshot.ratchetCount).toBe(1);
  expect(snapshot.profitFromShorts).toBeGreaterThan(0);
  expect(rows.at(-1)!.vaulterReturn).toBeCloseTo(snapshot.vaulterProfit);
  expect(rows.at(-1)!.hodlerReturn).toBeCloseTo(snapshot.hodlerProfit);
});
