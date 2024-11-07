import path from 'path';
import dayjs, { type Dayjs } from "dayjs";
import loadCsvFile from './loadCsvFile';
import IBitcoinPriceRecord from '../interfaces/IBitcoinPriceRecord';

const allBitcoinPrices = loadCsvFile(path.join(__dirname, '../data-input/bitcoin_prices.csv')).map((x: any) => {
  x.price = Number(x.price);
  return x as IBitcoinPriceRecord;
});

export default class BtcPrices {
  static get all(): IBitcoinPriceRecord[] {
    return allBitcoinPrices.map(x => ({ date: x.date, price: x.price }));
  }
  static getYear(yearToRun: string): IBitcoinPriceRecord[] {
    return allBitcoinPrices.filter((row: IBitcoinPriceRecord) => row.date.startsWith(yearToRun)).map(x => ({ date: x.date, price: x.price }));
  }
  static get(date: string | Dayjs): IBitcoinPriceRecord {
    if (date instanceof dayjs) {
      date = date.format('YYYY-MM-DD');
    }
    const found = allBitcoinPrices.find((row: IBitcoinPriceRecord) => row.date === date);
    return found ? { date: found.date, price: found.price } : null;
  }
}
