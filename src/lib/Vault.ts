import { Dayjs } from 'dayjs';
import IBitcoinPriceRecord from '../interfaces/IBitcoinPriceRecord';
import BtcFees from './BtcFees';
import BtcPrices from "./BtcPrices";

export type IActionType = 'enter-vault' | 'ratchet-up' | 'ratchet-down' | 'short' | 'exit-vault';

export interface IAction {
  date: string;
  price: number;
  type: IActionType;
  argonsMinted: number;
  qtyOfArgonsToBurn: number;
  costOfArgonsToBurn: number;
  securityFee: number;
  btcTransactionFee: number;
  argonTransactionFee: number;
  fees: number;
  cashChange: number;
  totalCashUnlocked: number;
  totalAccruedValue: number;
}

export interface IShort {
  date: Dayjs | 'EXIT';
  lowestPrice: number;
}

const VAULT_SECURITY_PCT = 0;

export default class Vault {
  public bitcoinCount: number;

  public actions: IAction[] = [];
  
  public shorts: IShort[] = [];
  public shortsByDate: Record<string, IShort> = {};

  public prices: IBitcoinPriceRecord[] = [];
  public btcFees: BtcFees;
  public ratchetDec: number;

  public startingDate: string;
  public endingDate: string;

  public hodlerExpenses = 0;

  public totalExpenses = 0;
  public totalArgonsMinted = 0;
  public totalCostOfArgonsToBurn = 0;
  public totalCashUnlocked = 0;
  public totalAccruedValue = 0;

  public profitFromShorts = 0;

  constructor(startingDate: string, endingDate: string, ratchetPct: number, shorts: IShort[], btcPrices: BtcPrices, btcFees: BtcFees, bitcoinCount: number) {
    this.startingDate = startingDate;
    this.endingDate = endingDate;
    this.ratchetDec = ratchetPct / 100;

    this.shorts = shorts;
    this.shortsByDate = shorts.reduce((acc, short) => {
      acc[short.date === 'EXIT' ? 'EXIT' : short.date.format('YYYY-MM-DD')] = short;
      return acc;
    }, {} as Record<string, IShort>);

    this.prices = btcPrices.getDateRange(startingDate, endingDate);
    this.btcFees = btcFees;
    this.bitcoinCount = bitcoinCount;
    this.run();
  }

  public get totalHodlerValue(): number {
    return (this.prices[this.prices.length - 1].price * this.bitcoinCount) - this.hodlerExpenses;
  }

  public get hodlerProfit(): number {
    return Vault.calculateProfit(this.prices[0].price * this.bitcoinCount, this.totalHodlerValue);
  }

  public get startingPrice(): number {
    return this.prices[0].price;
  }

  public get endingPrice(): number {
    return this.prices[this.prices.length - 1].price;
  }

  public get vaulterProfit(): number {
    const startingValue = this.startingPrice * this.bitcoinCount;
    const endingValue = this.totalAccruedValue;
    return Vault.calculateProfit(startingValue, endingValue);
  }

  public get profitFromInitialLock(): number {
    const lossSaved = Math.max(0, (this.startingPrice + this.hodlerExpenses) - this.endingPrice);
    return lossSaved * this.bitcoinCount;
  }

  public run() {
    this.actions = [];

    const bitcoinCount = this.bitcoinCount;

    {
      const startingPrice = this.prices[0].price;
      const qtyOfArgonsToBurn = 0;
      const costOfArgonsToBurn = 0;
      const securityFee = startingPrice * VAULT_SECURITY_PCT;
      const btcTransactionFee = this.btcFees.getByDate(this.startingDate);
      const argonTransactionFee = this.btcFees.getByDate(this.startingDate);
      const fees = securityFee + btcTransactionFee + argonTransactionFee;
      const cashChange = (startingPrice * bitcoinCount) - (costOfArgonsToBurn + fees);

      this.hodlerExpenses = fees;

      this.totalExpenses = fees;
      this.totalArgonsMinted = (startingPrice * bitcoinCount);
      this.totalCostOfArgonsToBurn = (costOfArgonsToBurn * bitcoinCount);
      this.totalCashUnlocked = cashChange;
      this.totalAccruedValue = cashChange;

      this.actions.push({
        date: this.startingDate,
        price: startingPrice,
        type: 'enter-vault',
        argonsMinted: (startingPrice * bitcoinCount),
        qtyOfArgonsToBurn,
        costOfArgonsToBurn,
        securityFee,
        btcTransactionFee,
        argonTransactionFee,
        fees,
        cashChange,
        totalCashUnlocked: this.totalCashUnlocked,
        totalAccruedValue: this.totalAccruedValue,
      });
    }

    for (const [index, item] of this.prices.entries()) {
      if (index === this.prices.length - 1) break;
      const currentPrice = item.price;
      const currentDate = item.date;
      const currentShort = this.shortsByDate[currentDate];
      
      const lastAction = this.actions[this.actions.length - 1];

      const changePct = Vault.calculateProfit(lastAction.price, currentPrice);
      const changeAbs = currentPrice - lastAction.price;
      const isEnoughChange = this.ratchetDec && (Math.abs(changeAbs) >= this.ratchetDec && Math.abs(changePct) >= this.ratchetDec);
      if (!isEnoughChange && !currentShort) {
        continue;
      }

      const unlockPriceOfBtc = Math.min(currentPrice, lastAction.price);

      let qtyOfArgonsToBurn = unlockPriceOfBtc * bitcoinCount;
      let costOfArgonsToBurn = unlockPriceOfBtc * bitcoinCount;

      if (currentShort) {
        qtyOfArgonsToBurn = Vault.calculateUnlockBurnPerBitcoinDollar(currentShort.lowestPrice) * unlockPriceOfBtc * bitcoinCount;
        const newCostOfArgonsToBurn = qtyOfArgonsToBurn * currentShort.lowestPrice;
        this.profitFromShorts += costOfArgonsToBurn - newCostOfArgonsToBurn;
        costOfArgonsToBurn = newCostOfArgonsToBurn;
      }

      const securityFee = currentPrice * VAULT_SECURITY_PCT;
      const btcTransactionFee = changePct > 0 ? this.btcFees.getByDate(currentDate) : 0;
      const argonTransactionFee = this.btcFees.getByDate(currentDate);
      const fees = securityFee + btcTransactionFee + argonTransactionFee;
      const cashChange = (currentPrice * bitcoinCount) - (costOfArgonsToBurn + fees);

      this.totalExpenses += fees;
      this.totalArgonsMinted += (currentPrice * bitcoinCount);
      this.totalCostOfArgonsToBurn += costOfArgonsToBurn;
      this.totalCashUnlocked += cashChange;
      this.totalAccruedValue += cashChange;

      this.actions.push({
        date: currentDate,
        price: currentPrice,
        type: currentShort ? 'short' : (changePct > 0 ? 'ratchet-up' : 'ratchet-down'),
        argonsMinted: (currentPrice * bitcoinCount),
        qtyOfArgonsToBurn,
        costOfArgonsToBurn,
        securityFee,
        btcTransactionFee,
        argonTransactionFee,
        fees,
        cashChange,
        totalCashUnlocked: this.totalCashUnlocked,
        totalAccruedValue: this.totalAccruedValue,
      });
    }
    
    {
      // unlock bitcoin at the end
      const endingPrice = this.prices[this.prices.length - 1].price;
      const lastAction = this.actions[this.actions.length - 1];
      
      const unlockPriceOfBtc = Math.min(endingPrice, lastAction.price);

      let qtyOfArgonsToBurn = unlockPriceOfBtc * bitcoinCount;
      let costOfArgonsToBurn = unlockPriceOfBtc * bitcoinCount;

      if (this.shortsByDate.EXIT) {
        const currentShort = this.shortsByDate.EXIT;
        qtyOfArgonsToBurn = Vault.calculateUnlockBurnPerBitcoinDollar(currentShort.lowestPrice) * unlockPriceOfBtc * bitcoinCount;
        const newCostOfArgonsToBurn = qtyOfArgonsToBurn * currentShort.lowestPrice;
        this.profitFromShorts += costOfArgonsToBurn - newCostOfArgonsToBurn;
        costOfArgonsToBurn = newCostOfArgonsToBurn;
      }

      const securityFee = endingPrice * VAULT_SECURITY_PCT;
      const btcTransactionFee = this.btcFees.getByDate(this.endingDate);
      const argonTransactionFee = this.btcFees.getByDate(this.endingDate);
      const fees = securityFee + btcTransactionFee + argonTransactionFee;
      const cashChange = -(costOfArgonsToBurn + fees);

      this.hodlerExpenses += fees;

      this.totalExpenses += fees;
      this.totalArgonsMinted += 0;
      this.totalCostOfArgonsToBurn += costOfArgonsToBurn;
      this.totalAccruedValue += (endingPrice * bitcoinCount) + cashChange;

      this.actions.push({
        date: this.endingDate,
        price: endingPrice,
        type: 'exit-vault',
        argonsMinted: 0,
        qtyOfArgonsToBurn,
        costOfArgonsToBurn,
        securityFee,
        btcTransactionFee,
        argonTransactionFee,
        fees,
        cashChange,
        totalCashUnlocked: this.totalCashUnlocked,
        totalAccruedValue: this.totalAccruedValue,
      });
    }
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
