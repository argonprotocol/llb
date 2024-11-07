import { expect, test } from 'bun:test';
import ChartController from '../controllers/ChartController';

test("test fetch bitcoin prices", async () => {
  const chartController = new ChartController();
  const bitcoinPrices = await chartController.fetchBitcoinPrices();

  const firstRecord = bitcoinPrices[0];
  const lastRecord = bitcoinPrices[bitcoinPrices.length - 1];

  expect(bitcoinPrices.length).toBe(5124);
  expect(firstRecord.date).toBe('2010-08-17');
  expect(firstRecord.price).toBe(0.07);

  expect(lastRecord.date).toBe('2024-08-26');
  expect(lastRecord.price).toBe(62857.78);
});

