import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { IBitcoinPriceRecord } from '../interfaces/IBitcoinPriceRecord';
import type { IClonableShort } from './Vault';

dayjs.extend(utc);
export type Side = 'left' | 'right';
export type DateRange = { left: string; right: string };
export type Scenario = { sliderDates: DateRange; bitcoinCount: number; ratchetPct: number; shorts: IClonableShort[] };

export function dateOnly(value: unknown): string {
  if (typeof value !== 'string' && !(value instanceof Date) && !dayjs.isDayjs(value)) return '';
  const parsed = dayjs.utc(value);
  if (!parsed.isValid()) return '';
  const date = parsed.format('YYYY-MM-DD');
  // Dayjs accepts overflow dates by normalizing them. Reject them at the input boundary.
  if (typeof value === 'string' && (!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value) || dayjs.utc(value.slice(0, 10)).format('YYYY-MM-DD') !== value.slice(0, 10))) return '';
  return date;
}
export function normalizeNumber(value: unknown, kind: 'bitcoinCount' | 'ratchetPct'): number {
  if (typeof value !== 'number' && (value === null || value === undefined || String(value).trim() === '' || !/^-?(?:\d+\.?\d*|\.\d+)$/.test(String(value).trim()))) {
    throw new Error('Enter a valid number.');
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error('Enter a finite number.');
  return kind === 'bitcoinCount' ? Math.max(1, Math.round(number)) : Math.max(0, Math.min(100, number));
}
export function createDateDomain(prices: IBitcoinPriceRecord[]) {
  const dates = prices.map(row => row.date);
  const indexByDate = new Map(dates.map((date, index) => [date, index]));
  const first = dates[0];
  const last = dates[dates.length - 1];
  function latestStart(end: string) {
    // Adding calendar months clamps month-end days, so subtracting six months is
    // not its inverse (August 31 + six months can be February 28).
    let lo = 0, hi = dates.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (dayjs.utc(dates[mid]).add(6, 'month').format('YYYY-MM-DD') <= end) lo = mid;
      else hi = mid - 1;
    }
    return dates[lo];
  }
  function bounds(side: Side, range: DateRange) {
    return side === 'left'
      ? { min: first, max: latestStart(range.right) }
      : { min: dayjs.utc(range.left).add(6, 'month').format('YYYY-MM-DD'), max: last };
  }
  function validate(range: DateRange) {
    if (!indexByDate.has(range.left) || !indexByDate.has(range.right)) throw new Error('Choose a date within the supported Bitcoin history.');
    if (range.right < dayjs.utc(range.left).add(6, 'month').format('YYYY-MM-DD')) throw new Error('Choose an exit date at least six calendar months after the start.');
  }
  function clamp(side: Side, index: number, range: DateRange): string {
    const limits = bounds(side, range);
    const safeIndex = Math.max(0, Math.min(dates.length - 1, Math.round(index)));
    const date = dates[safeIndex];
    return date < limits.min ? limits.min : date > limits.max ? limits.max : date;
  }
  return { dates, indexByDate, first, last, latestStart, bounds, validate, clamp };
}
export type DateDomain = ReturnType<typeof createDateDomain>;

export function isActiveDrop(short: IClonableShort, range: DateRange) {
  return short.date === 'EXIT' || (short.date > range.left && short.date < range.right);
}
export function validatePriceDrop(date: unknown, value: unknown, range: DateRange, shorts: IClonableShort[], target: number, domain: DateDomain): IClonableShort {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0 || price >= target) throw new Error(`Enter a USD price greater than zero and below the $${target} target.`);
  const normalizedDate = dateOnly(date);
  if (!domain.indexByDate.has(normalizedDate) || normalizedDate <= range.left || normalizedDate >= range.right) throw new Error('Choose a date strictly between the start and exit dates.');
  if (shorts.some(short => short.date === normalizedDate)) throw new Error('A price drop is already configured on this date.');
  return { date: normalizedDate, lowestPrice: price };
}
export function restoreScenario(saved: Record<string, any>, domain: DateDomain, target: number): Scenario {
  const restoreDate = (side: Side, fallback: string) => {
    const savedIndex = saved.sliderIndexes?.[side];
    const date = Number.isInteger(savedIndex) && domain.dates[savedIndex] ? domain.dates[savedIndex] : dateOnly(saved.sliderDates?.[side]);
    return domain.indexByDate.has(date) ? date : fallback;
  };
  const yearAgo = dayjs.utc(domain.last).subtract(1, 'year').format('YYYY-MM-DD');
  let left = restoreDate('left', yearAgo < domain.first ? domain.first : yearAgo);
  let right = restoreDate('right', domain.last);
  const latestStart = domain.latestStart(domain.last);
  left = left > latestStart ? latestStart : left;
  const earliestEnd = dayjs.utc(left).add(6, 'month').format('YYYY-MM-DD');
  right = right < earliestEnd ? earliestEnd : right;
  const safeNumber = (value: unknown, kind: 'bitcoinCount' | 'ratchetPct', fallback: number) => {
    try { return normalizeNumber(value ?? fallback, kind); } catch { return fallback; }
  };
  const seen = new Set<string>();
  const shorts: IClonableShort[] = [];
  for (const short of Array.isArray(saved.shorts) ? saved.shorts : []) {
    const date = short?.date === 'EXIT' ? 'EXIT' : dateOnly(short?.date);
    const price = Number(short?.lowestPrice);
    if ((date === 'EXIT' || domain.indexByDate.has(date)) && Number.isFinite(price) && price > 0 && price < target && !seen.has(date)) {
      seen.add(date);
      shorts.push({ date, lowestPrice: price });
    }
  }
  return { sliderDates: { left, right }, bitcoinCount: safeNumber(saved.bitcoinCount, 'bitcoinCount', 1), ratchetPct: safeNumber(saved.ratchetPct, 'ratchetPct', 10), shorts };
}
