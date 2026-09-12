import { writeFileSync } from 'node:fs';
import axios from 'axios';

const BASE_URL = 'https://api.blockchain.info/charts/market-price';
const START_DATE = '2010-07-18';
const TODAY = new Date().toISOString().split('T')[0];

async function fetchBitcoinData() {
  try {
    const response = await axios.get(BASE_URL, {
      timeout: 60_000,
      params: { timespan: 'all', start: START_DATE, format: 'json', sampled: false },
    });
    const { values } = response.data;
    if (!Array.isArray(values) || !values.length) throw new Error('No Bitcoin prices returned');

    const data = [];
    for (const item of values) {
      if (!Number.isFinite(item.x) || !Number.isFinite(item.y) || item.y < 0) {
        throw new Error('Invalid Bitcoin price record');
      }
      // The API timestamps are Unix seconds in UTC; do not shift them by an hour.
      const date = new Date(item.x * 1000).toISOString().split('T')[0];
      if (date < START_DATE || date >= TODAY) continue;
      if (!data.length && item.y === 0) continue;
      if (item.y === 0) throw new Error(`Missing Bitcoin price for ${date}`);
      data.push({ millis: item.x, date, price: item.y });
    }
    if (!data.length) throw new Error('No completed daily Bitcoin prices returned');

    const filePath = new URL('../src/data/bitcoinPrices.json', import.meta.url);
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`Saved ${data.length} Bitcoin prices (${data[0].date} through ${data.at(-1).date}) to src/data/bitcoinPrices.json`);
  } catch (error) {
    console.error('Error fetching Bitcoin prices:', error.message);
    process.exitCode = 1;
  }
}

await fetchBitcoinData();
