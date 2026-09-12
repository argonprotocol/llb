import { expect, test } from 'vitest';
import BitcoinFees from '../src/lib/BitcoinFees';
import BitcoinPrices from '../src/lib/BitcoinPrices';
import Download from '../src/lib/Download';
import Vault, { type IClonableShort } from '../src/lib/Vault';
import VaultSnapshot from '../src/lib/VaultSnapshot';

function simulate(prices: number[], bitcoinCount = 1, ratchetPct = 0, shorts: IClonableShort[] = [], fee = 1, target = 1, targetUpdatedAt = '') {
  const bitcoinPrices = new BitcoinPrices();
  bitcoinPrices.prices = prices.map((price, index) => ({ date: `2024-01-0${index + 1}`, price }));
  bitcoinPrices.indexByDate = Object.fromEntries(bitcoinPrices.prices.map(({ date }, index) => [date, index]));
  const bitcoinFees = new BitcoinFees();
  bitcoinFees.getByDate = () => fee;
  const vault = new Vault('2024-01-01', `2024-01-0${prices.length}`, ratchetPct, shorts, bitcoinPrices, bitcoinFees, bitcoinCount, target, targetUpdatedAt);
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


test('non-dollar target scales minted and burned ARGN while preserving USD ratchet returns', () => {
  const baseline = simulate([100, 120, 80, 100], 2, 10);
  const { vault, snapshot, rows, download } = simulate([100, 120, 80, 100], 2, 10, [], 1, 1.058, '2026-09-12T02:46:58.730Z');
  for (const [index, action] of vault.actions.entries()) {
    const original = baseline.vault.actions[index];
    expect(action.argonsMinted).toBeCloseTo(original.argonsMinted / 1.058);
    expect(action.qtyOfArgonsToBurn).toBeCloseTo(original.qtyOfArgonsToBurn / 1.058);
    expect(action.costOfArgonsToBurn).toBeCloseTo(original.costOfArgonsToBurn);
    expect(action.cashChange).toBeCloseTo(original.cashChange);
    expect(action.fees).toBe(original.fees);
  }
  expect(vault.totalArgonsMinted).toBeCloseTo(baseline.vault.totalArgonsMinted / 1.058);
  expect(snapshot.vaulterProfit).toBeCloseTo(baseline.snapshot.vaulterProfit);
  expect(snapshot.hodlerProfit).toBeCloseTo(baseline.snapshot.hodlerProfit);
  expect(rows[0].argonTargetUpdatedAt).toBe('2026-09-12T02:46:58.730Z');
  expect(rows.every(row => row.usdTargetForArgon === 1.058)).toBe(true);
  const csv = download.generateCSV(rows).split('\n');
  const headers = csv[0].split(',');
  const firstRow = csv[1].split(',');
  expect(Number(firstRow[headers.indexOf('argonsMinted')])).toBeCloseTo(200 / 1.058);
  expect(Number(firstRow[headers.indexOf('usdTargetForArgon')])).toBe(1.058);
});

for (const date of ['2024-01-02', 'EXIT']) {
  test(`a 50% target drop uses USD / target for ${date}`, () => {
    const { vault, snapshot, rows } = simulate([100, 100, 100], 2, 0, [{ date, lowestPrice: 1 }], 0, 2);
    const action = vault.actions.find(action => action.type === (date === 'EXIT' ? 'exit-vault' : 'short'))!;
    // At a $2 target, 200 USD locks mint 100 ARGN. The 50% drop burns
    // 135.06 ARGN at $1 each, saving $64.94 compared with a $200 unlock.
    expect(action.qtyOfArgonsToBurn).toBeCloseTo(135.06);
    expect(action.costOfArgonsToBurn).toBeCloseTo(135.06);
    expect(snapshot.profitFromShorts).toBeCloseTo(64.94);
    expect(snapshot.totalAccruedValue).toBeCloseTo(264.94);
    expect(rows.at(-1)!.vaulterReturn).toBeCloseTo(0.3247);
  });
}

for (const ratio of [0.95, 0.5, 0.005]) {
  test(`equivalent price ratios preserve dollar gains at ratio ${ratio}`, () => {
    const baseline = simulate([100, 120, 80, 100], 2, 10, [{ date: '2024-01-03', lowestPrice: ratio }]);
    const scaled = simulate([100, 120, 80, 100], 2, 10, [{ date: '2024-01-03', lowestPrice: ratio * 1.058 }], 1, 1.058);
    expect(scaled.snapshot.profitFromShorts).toBeCloseTo(baseline.snapshot.profitFromShorts);
    expect(scaled.snapshot.totalAccruedValue).toBeCloseTo(baseline.snapshot.totalAccruedValue);
  });
}

test('invalid targets cannot enter the accounting engine', () => {
  for (const target of [0, -1, NaN, Infinity]) {
    expect(() => simulate([100, 100], 1, 0, [], 1, target)).toThrow('finite positive');
  }
});
