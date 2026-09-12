import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { IBitcoinFeeRecord } from '../interfaces/IBitcoinFeeRecord';
import BitcoinPrices from './BitcoinPrices';
import bitcoinFees from '../data/bitcoinFees.json';

dayjs.extend(utc);

export default class BitcoinFees {
  public feeByDate: Record<string, number> = {};
  public bitcoinPrices: BitcoinPrices = new BitcoinPrices();

  constructor() {
    this.feeByDate = Object.fromEntries(bitcoinFees.map((record: IBitcoinFeeRecord) => [record.date, Number(record.feeInBitcoins)]));
  }

  private getByDateAsBtc(date: string): number {
    return this.feeByDate[date];
  }

  public getByDate(date: string): number {
    const feeAsBtc = this.getByDateAsBtc(date);
    if (!feeAsBtc) {
      const lastDate = dayjs.utc(date).subtract(1, 'day');
      if (lastDate.isBefore('2010-07-18')) {
        throw new Error('Date is before 2010-07-18');
      }
      return this.getByDate(lastDate.format('YYYY-MM-DD'));
    }
    const dollarToBitcoin = this.bitcoinPrices.getByDate(date).price;
    const fee = feeAsBtc * dollarToBitcoin;
    return fee;
  }
}