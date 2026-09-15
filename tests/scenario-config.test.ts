import { describe, expect, test } from 'vitest';
import dayjs from 'dayjs';
import BitcoinPrices from '../src/lib/BitcoinPrices';
import { createChartOptions, getYearIntervals } from '../src/lib/ChartOptions';
import { createDateDomain, dateOnly, isActiveDrop, normalizeNumber, restoreScenario, validatePriceDrop } from '../src/lib/ScenarioConfig';

const prices = new BitcoinPrices().prices;
const domain = createDateDomain(prices);
const range = { left: '2020-10-02', right: '2022-05-09' };

describe('scenario input boundaries', () => {
  test('keeps whole-BTC normalization and supports zero and capped thresholds', () => {
    expect(normalizeNumber('3.6', 'bitcoinCount')).toBe(4);
    expect(normalizeNumber('-10', 'bitcoinCount')).toBe(1);
    expect(normalizeNumber('0', 'ratchetPct')).toBe(0);
    expect(normalizeNumber('105', 'ratchetPct')).toBe(100);
    expect(normalizeNumber(normalizeNumber('0.0000001', 'ratchetPct'), 'ratchetPct')).toBe(0.0000001);
    for (const value of ['', ' ', '12btc', '1.2.3', NaN, Infinity, null]) {
      expect(() => normalizeNumber(value, 'bitcoinCount')).toThrow();
    }
  });
  test('uses UTC date-only values and rejects overflow and ambiguous strings', () => {
    expect(dateOnly('2024-02-29')).toBe('2024-02-29');
    expect(dateOnly('2023-02-29')).toBe('');
    expect(dateOnly('02/29/2024')).toBe('');
    expect(dateOnly(new Date('2024-03-01T00:30:00+09:00'))).toBe('2024-02-29');
    expect(dateOnly('2024-02-29T23:30:00-06:00')).toBe('2024-03-01');
  });
  test('enforces six calendar months, including month ends and leap years', () => {
    for (const dates of [
      { left: '2010-08-18', right: '2011-02-18' },
      { left: '2025-06-30', right: '2025-12-31' },
      { left: '2022-08-31', right: '2023-02-28' },
      { left: '2023-08-31', right: '2024-02-29' },
    ]) expect(() => domain.validate(dates)).not.toThrow();
    expect(domain.bounds('left', { left: '2022-08-31', right: '2023-02-28' }).max).toBe('2022-08-31');
    expect(() => domain.validate({ left: '2023-08-31', right: '2024-02-28' })).toThrow('six calendar months');
    expect(() => domain.validate({ ...range, right: dayjs.utc(domain.last).add(1, 'day').format('YYYY-MM-DD') })).toThrow('supported');
    expect(domain.first).toBe(prices[0].date);
    expect(domain.last).toBe(prices[prices.length - 1].date);
    expect(domain.clamp('left', -100, range)).toBe(domain.first);
    expect(domain.clamp('right', 100000, range)).toBe(domain.last);
  });
  test('chart limits, date controls, and year intervals extend with appended data', () => {
    const appended = Array.from({ length: 370 }, (_, index) => ({ date: dayjs.utc(domain.last).add(index + 1, 'day').format('YYYY-MM-DD'), price: 100 }));
    const extended = createDateDomain([...prices, ...appended]);
    expect(extended.last).toBe(appended[appended.length - 1].date);
    expect(extended.indexByDate.get(extended.last)).toBe(prices.length + appended.length - 1);
    expect(extended.bounds('right', range).max).toBe(extended.last);
    expect(() => extended.validate({ ...range, right: extended.last })).not.toThrow();
    const scale = createChartOptions([], [], () => {}, extended).options.scales.x;
    expect(scale.min).toBe(dayjs.utc(prices[0].date).valueOf());
    expect(scale.max).toBe(dayjs.utc(extended.last).valueOf());
    const years = getYearIntervals(scale.min, scale.max);
    expect(years[0].start).toBe(scale.min);
    expect(years[years.length - 1].end).toBe(scale.max);
    expect(years[years.length - 1].label).toBe(extended.last.slice(0, 4));
    expect(years.reduce((total, year) => total + year.end - year.start, 0)).toBe(scale.max - scale.min);
    for (let index = 1; index < years.length; index++) expect(years[index].start).toBe(years[index - 1].end);
    expect(restoreScenario({ sliderDates: { ...range, right: extended.last } }, extended, 1.058).sliderDates.right).toBe(extended.last);
    expect(restoreScenario({}, extended, 1.058).sliderDates).toEqual({
      left: dayjs.utc(extended.last).subtract(1, 'year').format('YYYY-MM-DD'), right: extended.last,
    });
  });
  test('year labels include a new year when its first record arrives', () => {
    const years = getYearIntervals(dayjs.utc('2026-09-11').valueOf(), dayjs.utc('2027-01-01').valueOf());
    expect(years.map(year => year.label)).toEqual(['2026', '2027']);
    expect(years[1].end).toBe(years[1].start);
  });
  test('restores zero, defaults, invalid saved dates, and EXIT without losing inactive drops', () => {
    expect(restoreScenario({}, domain, 1.058).sliderDates).toEqual({
      left: dayjs.utc(domain.last).subtract(1, 'year').format('YYYY-MM-DD'), right: domain.last,
    });
    const saved = { ratchetPct: 0, bitcoinCount: 2, sliderDates: range, shorts: [
      { date: 'EXIT', lowestPrice: 0.5 }, { date: '2015-01-01', lowestPrice: 0.8 },
      { date: '2015-01-01', lowestPrice: 0.7 }, { date: 'bad', lowestPrice: 0.2 },
    ] };
    const result = restoreScenario(saved, domain, 1.058);
    expect(result.sliderDates).toEqual(range);
    expect(result.ratchetPct).toBe(0);
    expect(result.shorts).toHaveLength(2);
    expect(isActiveDrop(result.shorts[0], range)).toBe(true);
    expect(isActiveDrop(result.shorts[1], range)).toBe(false);
    expect(isActiveDrop(result.shorts[1], { left: domain.first, right: domain.last })).toBe(true);
    const repaired = restoreScenario({ sliderDates: { left: domain.last, right: domain.first } }, domain, 1.058);
    expect(() => domain.validate(repaired.sliderDates)).not.toThrow();
  });
  test('latest-year defaults clamp leap day and shorter history to available dates', () => {
    const leapDomain = createDateDomain(prices.filter(row => row.date <= '2024-02-29'));
    expect(restoreScenario({}, leapDomain, 1.058).sliderDates).toEqual({ left: '2023-02-28', right: '2024-02-29' });
    const shortDomain = createDateDomain(prices.filter(row => row.date >= '2023-06-01' && row.date <= '2024-02-29'));
    const restored = restoreScenario({}, shortDomain, 1.058);
    expect(restored.sliderDates).toEqual({ left: '2023-06-01', right: '2024-02-29' });
    expect(() => shortDomain.validate(restored.sliderDates)).not.toThrow();
  });
  test('validates a drop against the latest range, duplicates, and fixed target', () => {
    expect(validatePriceDrop('2021-01-01', '0.5', range, [], 1.058, domain)).toEqual({ date: '2021-01-01', lowestPrice: 0.5 });
    for (const date of [range.left, range.right, '2020-02-30', 'EXIT']) {
      expect(() => validatePriceDrop(date, 0.5, range, [], 1.058, domain)).toThrow();
    }
    for (const price of ['', 0, -1, Infinity, 'NaN', 1.058, 2]) {
      expect(() => validatePriceDrop('2021-01-01', price, range, [], 1.058, domain)).toThrow();
    }
    expect(() => validatePriceDrop('2021-01-01', 0.5, range, [{ date: '2021-01-01', lowestPrice: 0.3 }], 1.058, domain)).toThrow('already');
  });
});
