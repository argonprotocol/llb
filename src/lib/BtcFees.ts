import dayjs from 'dayjs';
import IBitcoinFeeRecord from '../interfaces/IBitcoinFeeRecord';
import BtcPrices from './BtcPrices';

export default class BtcFees {
  private feeByDate: Record<string, number> = {};
  private btcPrices: BtcPrices;

  constructor(btcPrices: BtcPrices) {
    this.btcPrices = btcPrices;
  }
  
  public load(bitcoinTransactionFees: IBitcoinFeeRecord[]) {
    this.feeByDate = Object.fromEntries(bitcoinTransactionFees.map((record: IBitcoinFeeRecord) => [record.date, Number(record.feeInBitcoins)]));
  }

  public getInBitcoins(date: string): number {
    return this.feeByDate[date];
  }

  public getByDate(date: string): number {
    const feeInBitcoins = this.getInBitcoins(date);
    if (!feeInBitcoins) {
      const lastDate = dayjs.utc(date).subtract(1, 'day').format('YYYY-MM-DD')
      return this.getByDate(lastDate);
    }
    const dollarToBitcoin = this.btcPrices.getByDate(date).price;
    const fee = feeInBitcoins * dollarToBitcoin;
    return fee;
  }
}