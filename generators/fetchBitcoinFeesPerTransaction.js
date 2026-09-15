import { writeFileSync } from 'node:fs';
import axios from 'axios';

const FEE_URL = 'https://api.blockchain.info/charts/transaction-fees';
const TX_COUNT_URL = 'https://api.blockchain.info/charts/n-transactions';
const START_DATE = '2010-07-18';
const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.parse(TODAY) - 86_400_000).toISOString().split('T')[0];

async function fetchData(url) {
  const response = await axios.get(url, {
    timeout: 60_000,
    params: { timespan: 'all', start: START_DATE, format: 'json', sampled: false },
  });
  const { values } = response.data;
  if (!Array.isArray(values) || !values.length) throw new Error(`No data returned from ${url}`);
  return values;
}

async function fetchBitcoinFeeData() {
  try {
    const [feeData, txCountData] = await Promise.all([
      fetchData(FEE_URL),
      fetchData(TX_COUNT_URL),
    ]);
    const txCountByTimestamp = new Map(txCountData.map(item => [item.x, item.y]));
    const data = [];

    for (const item of feeData) {
      if (!Number.isFinite(item.x) || !Number.isFinite(item.y) || item.y < 0) {
        throw new Error('Invalid Bitcoin fee record');
      }
      const date = new Date(item.x * 1000).toISOString().split('T')[0];
      if (date < START_DATE || date >= TODAY) continue;
      const txCount = txCountByTimestamp.get(item.x);
      if (!Number.isFinite(txCount) || txCount <= 0) {
        throw new Error(`Missing or invalid transaction count for ${date}`);
      }
      data.push({ date, feeInBitcoins: Number((item.y / txCount).toFixed(8)) });
    }
    if (!data.length) throw new Error('No completed daily Bitcoin fees returned');
    data.sort((a, b) => a.date.localeCompare(b.date));
    if (new Set(data.map(row => row.date)).size !== data.length) {
      throw new Error('Duplicate Bitcoin fee date');
    }
    if (data.at(-1).date !== YESTERDAY) {
      throw new Error(`Bitcoin fees end at ${data.at(-1).date}; waiting for ${YESTERDAY}`);
    }

    const filePath = new URL('../src/data/bitcoinFees.json', import.meta.url);
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`Saved ${data.length} Bitcoin fees (${data[0].date} through ${data.at(-1).date}) to src/data/bitcoinFees.json`);
  } catch (error) {
    console.error('Error fetching Bitcoin fees:', error.message);
    process.exitCode = 1;
  }
}

await fetchBitcoinFeeData();
