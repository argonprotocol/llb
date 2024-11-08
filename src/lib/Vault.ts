import IBitcoinPriceRecord from '../interfaces/IBitcoinPriceRecord';
import BtcFees from './BtcFees';
import BtcPrices from "./BtcPrices";

export type IActionType = 'enter-vault' | 'ratchet-up' | 'ratchet-down' | 'short' | 'exit-vault';

export interface IAction {
  date: string;
  price: number;
  type: IActionType;
  argonsMinted: number;
  costOfArgonBurn: number;
  securityFee: number;
  btcTransactionFee: number;
  liquidCash: number;
  aggregatedLiquidCash: number;
}

export interface IShort {
  date: string;
  lowestPrice: number;
}

const VAULT_SECURITY_PCT = 0;
const MIN_RATCHET_CHANGE_PCT = 0.1;
const MIN_RATCHET_CHANGE_ABS = 0.1;

export default class Vault {
  public actions: IAction[] = [];
  
  public shorts: IShort[] = [];
  public shortsByDate: Record<string, IShort> = {};

  private prices: IBitcoinPriceRecord[] = [];
  private btcFees: BtcFees;
  private ratchetDec: number;

  private startingDate: string;
  private endingDate: string;

  public totalExpenses = 0;
  public totalArgonsMinted = 0;
  public totalCostOfArgonBurn = 0;
  public aggregatedLiquidCash = 0;

  constructor(startingDate: string, endingDate: string, ratchetPct: number, shorts: IShort[], btcPrices: BtcPrices, btcFees: BtcFees) {
    this.startingDate = startingDate;
    this.endingDate = endingDate;
    this.ratchetDec = ratchetPct / 100;

    this.shorts = shorts;
    this.shortsByDate = shorts.reduce((acc, short) => {
      acc[short.date] = short;
      return acc;
    }, {} as Record<string, IShort>);

    this.prices = btcPrices.getDateRange(startingDate, endingDate);
    this.btcFees = btcFees;
    this.run();
  }

  public get hodlerProfit(): number {
    return Vault.calculateProfit(this.prices[0].price, this.actions[this.actions.length - 1].price);
  }

  public get startingPrice(): number {
    return this.prices[0].price;
  }

  public get endingPrice(): number {
    return this.prices[this.prices.length - 1].price;
  }

  public get vaulterProfit(): number {
    const startingValue = this.startingPrice;
    const endingValue = this.aggregatedLiquidCash;
    return Vault.calculateProfit(startingValue, endingValue);
  }

  private run() {
    this.actions = [];

    {
      const startingPrice = this.prices[0].price;
      const costOfArgonBurn = 0;
      const securityFee = startingPrice * VAULT_SECURITY_PCT;
      const btcTransactionFee = this.btcFees.getByDate(this.startingDate);
      const liquidCash = startingPrice - (costOfArgonBurn + securityFee + btcTransactionFee);

      this.totalExpenses = securityFee + btcTransactionFee;
      this.totalArgonsMinted = startingPrice;
      this.totalCostOfArgonBurn = costOfArgonBurn;
      this.aggregatedLiquidCash = liquidCash;

      this.actions.push({
        date: this.startingDate,
        price: startingPrice,
        type: 'enter-vault',
        argonsMinted: startingPrice,
        costOfArgonBurn,
        securityFee,
        btcTransactionFee,
        liquidCash,
        aggregatedLiquidCash: this.aggregatedLiquidCash,
      });
    }

    for (const item of this.prices) {
      const currentPrice = item.price;
      const currentDate = item.date;
      const currentShort = this.shortsByDate[currentDate];
      
      const lastAction = this.actions[this.actions.length - 1];

      const changePct = Vault.calculateProfit(lastAction.price, currentPrice);
      const changeAbs = currentPrice - lastAction.price;
      const isEnoughChange = Math.abs(changeAbs) >= this.ratchetDec && Math.abs(changePct) >= this.ratchetDec;
      if (!isEnoughChange && !currentShort) {
        continue;
      }

      let costOfArgonBurn =  Math.min(currentPrice, lastAction.price);

      if (currentShort) {
        costOfArgonBurn = Vault.calculateUnlockPriceInDollars(currentPrice, currentShort.lowestPrice);
      }

      const securityFee = currentPrice * VAULT_SECURITY_PCT;
      const btcTransactionFee = changePct > 0 ? this.btcFees.getByDate(currentDate) : 0;
      const liquidCash = currentPrice - (costOfArgonBurn + securityFee + btcTransactionFee);

      this.totalExpenses += securityFee + btcTransactionFee;
      this.totalArgonsMinted += currentPrice;
      this.totalCostOfArgonBurn += costOfArgonBurn;
      this.aggregatedLiquidCash += liquidCash;

      this.actions.push({
        date: currentDate,
        price: currentPrice,
        type: currentShort ? 'short' : (changePct > 0 ? 'ratchet-up' : 'ratchet-down'),
        argonsMinted: currentPrice,
        costOfArgonBurn,
        securityFee,
        btcTransactionFee,
        liquidCash,
        aggregatedLiquidCash: this.aggregatedLiquidCash,
      });
    }

    if (this.actions[this.actions.length - 1].date !== this.endingDate) {
      // unlock bitcoin at the end
      const endingPrice = this.prices[this.prices.length - 1].price;
      const lastAction = this.actions[this.actions.length - 1];
      const costOfArgonBurn =  Math.min(endingPrice, lastAction.price);

      const securityFee = endingPrice * VAULT_SECURITY_PCT;
      const btcTransactionFee = this.btcFees.getByDate(this.endingDate);
      const liquidCash = endingPrice - (costOfArgonBurn + securityFee + btcTransactionFee);

      this.totalExpenses += securityFee + btcTransactionFee;
      this.totalArgonsMinted += 0;
      this.totalCostOfArgonBurn += costOfArgonBurn;
      this.aggregatedLiquidCash += liquidCash;

      this.actions.push({
        date: this.endingDate,
        price: endingPrice,
        type: 'exit-vault',
        argonsMinted: 0,
        costOfArgonBurn,
        securityFee,
        btcTransactionFee,
        liquidCash,
        aggregatedLiquidCash: this.aggregatedLiquidCash,
      });
    } else if (this.actions.length === 1) {
      const lastAction = this.actions[this.actions.length - 1];
      lastAction.type = 'exit-vault';
    }
  }

  public static calculateUnlockPriceInDollars(priceInDollars: number, argonRatioPrice: number): number {
    const unlockBurnPerBitcoinDollar = Vault.calculateUnlockBurnPerBitcoinDollar(argonRatioPrice);
    return priceInDollars * unlockBurnPerBitcoinDollar * argonRatioPrice;
  }
  
  public static calculateUnlockBurnPerBitcoinDollar(argonRatioPrice: number): number {
    const r = argonRatioPrice;
    const b = 1;
    if (argonRatioPrice >= 1.00) {
      return b;
    } else if (r >= 0.90) {
      return 20 * Math.pow(r, 2) - 38 * r + 19;
    } else if (r >= 0.01) {
      return (0.5618 * r + 0.3944) / r;
    } else {
      return (b / r) * (0.576 * r + 0.40);
    }
  }

  private static calculateProfit(buyPrice: number, sellPrice: number): number {
    return (sellPrice - buyPrice) / buyPrice;
  }
}
