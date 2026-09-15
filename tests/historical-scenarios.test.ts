import { expect, test, vi } from 'vitest';
import dayjs from 'dayjs';
import JSZip from 'jszip';
import BitcoinPrices from '../src/lib/BitcoinPrices';
import BitcoinFees from '../src/lib/BitcoinFees';
import Vault, { type IClonableShort } from '../src/lib/Vault';
import VaultSnapshot from '../src/lib/VaultSnapshot';
import Download from '../src/lib/Download';
import target from '../src/data/argonTarget.json';

const prices = new BitcoinPrices().prices;
const firstDate = prices[0].date;
const lastDate = prices[prices.length - 1].date;

function simulate(start: string, end: string, quantity = 1, threshold = 10, shorts: IClonableShort[] = []) {
  const vault = new Vault(start, end, threshold, shorts, new BitcoinPrices(), new BitcoinFees(), quantity, target.usdTargetForArgon, target.lastUpdatedAt);
  const snapshot = new VaultSnapshot(); snapshot.update(vault);
  return snapshot;
}
test('the default historical scenario retains the recorded desktop results and full ZIP export', async () => {
  const snapshot = simulate('2020-10-02', '2022-05-09');
  expect(snapshot.ratchetCount).toBe(59);
  expect(snapshot.shortCount).toBe(0);
  expect(snapshot.totalCashUnlocked).toBeCloseTo(170402.76, 2);
  expect(snapshot.totalAccruedValue).toBeCloseTo(170397.93, 2);
  expect(snapshot.actions).toHaveLength(61);
  const download = new Download(structuredClone(snapshot));
  const save = vi.spyOn(download, 'downloadBlob').mockImplementation(() => {});
  await download.run();
  const [blob, filename] = save.mock.calls[0];
  expect(filename).toBe('data.zip');
  const archive = await JSZip.loadAsync(await blob.arrayBuffer());
  const csv = await archive.file('data/data.csv')!.async('string');
  const lines = csv.split('\n');
  expect(lines).toHaveLength(586); // Header plus every day, including both endpoints.
  expect(lines[0]).toBe('date,usdTargetForArgon,argonTargetUpdatedAt,btcPrice,btcChangeSinceLastVault,btcTransactionFee,argonTransactionFee,actionType,argonsMinted,qtyOfArgonsToBurn,costOfArgonsToBurn,cashChange,totalCashUnlocked,totalAccruedValue,vaulterReturn,hodlerReturn');
  expect(lines[1].startsWith('2020-10-02,')).toBe(true);
  const last = lines.at(-1)!.split(',');
  expect(last[0]).toBe('2022-05-09');
  expect(Number(last.at(-2))).toBeCloseTo(snapshot.vaulterProfit);
  expect(Number(last.at(-1))).toBeCloseTo(snapshot.hodlerProfit);
});
test.each([
  ['2010-08-18', '2011-02-18', 1, 10, []],
  ['2025-06-30', '2025-12-31', 10, 0, []],
  ['2010-08-18', '2025-12-31', 4, 100, []],
  [firstDate, lastDate, 4, 100, []],
  [dayjs.utc(lastDate).subtract(6, 'month').format('YYYY-MM-DD'), lastDate, 1, 10, []],
  ['2020-10-02', '2022-05-09', 2, 10, [{ date: '2021-01-01', lowestPrice: 0.5 }, { date: '2021-08-01', lowestPrice: 0.7 }, { date: 'EXIT', lowestPrice: 0.8 }]],
] as [string, string, number, number, IClonableShort[]][] )('supported history %s to %s produces complete consistent exports', (start, end, quantity, threshold, shorts) => {
  const snapshot = simulate(start, end, quantity, threshold, shorts);
  const records = new Download(structuredClone(snapshot)).generateData();
  expect(snapshot.isLoaded).toBe(true);
  expect(Number.isFinite(snapshot.vaulterProfit)).toBe(true);
  expect(records[0].date).toBe(start);
  expect(records.at(-1)?.date).toBe(end);
  expect(records.at(-1)?.vaulterReturn).toBeCloseTo(snapshot.vaulterProfit);
  expect(records.at(-1)?.hodlerReturn).toBeCloseTo(snapshot.hodlerProfit);
});
