import IBitcoinPriceRecord from "../interfaces/IBitcoinPriceRecord";
import IRules from "../interfaces/IRules";
import BtcFees from "./BtcFees";
import BtcPrices from "./BtcPrices";

interface IRatchet {
  date: string;
  price: number;
  argonsMinted: number;
  argonsBurned: number;
  securityFee: number;
  btcTransactionFee: number;
}

const VAULT_SECURITY_PCT = 0;
const MIN_RATCHET_CHANGE_PCT = 0.1;
const MIN_RATCHET_CHANGE_ABS = 0.1;

export default class Vault {
  public ratchets: any[] = [];
  private prices: IBitcoinPriceRecord[] = BtcPrices.all;

  constructor(private rules: IRules) {
    this.run();
  }

  private get lastPrice() {
    const lastRatchet = this.ratchets[this.ratchets.length - 1];
    return lastRatchet ? lastRatchet.price : this.prices[0].price;
  }

  private run() {
    for (const item of this.prices) {
      const currentPrice = item.price;
      const currentDate = item.date;

      const changePct = Vault.calculateProfit(this.lastPrice, currentPrice);
      const changeAbs = currentPrice - this.lastPrice;
      if (Math.abs(changeAbs) < MIN_RATCHET_CHANGE_ABS || Math.abs(changePct) < MIN_RATCHET_CHANGE_PCT) {
        continue;
      }

      const argonsBurned =  Math.min(currentPrice, this.lastPrice);
      const btcTransactionFee = changePct > 0 ? BtcFees.get(currentDate) : 0;

      this.ratchets.push({
        date: currentDate,
        price: currentPrice,
        argonsMinted: currentPrice,
        argonsBurned,
        securityFee: currentPrice * VAULT_SECURITY_PCT,
        btcTransactionFee,
      });
    }
  }

  private static calculateProfit(buyPrice: number, sellPrice: number): number {
    return (sellPrice - buyPrice) / buyPrice;
  }
}
