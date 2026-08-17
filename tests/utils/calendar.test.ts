import {
  addCalendarDays,
  calendarDateRange,
  compareCalendarDates,
  createCalendarMonthGrid,
  formatCalendarDate,
  getCalendarLunarLabel,
  normalizeCalendarDate,
} from '../../src';

describe('calendar utilities', () => {
  it('normalizes date-only inputs without a UTC calendar shift', () => {
    expect(formatCalendarDate(normalizeCalendarDate('2024-05-01')!)).toBe('2024-05-01');
    expect(normalizeCalendarDate('2024-02-30')).toBeNull();
    expect(normalizeCalendarDate('2024/05/01')).toBeNull();
  });

  it('compares and advances local calendar days', () => {
    const start = normalizeCalendarDate('2024-05-01')!;
    const end = normalizeCalendarDate('2024-05-03')!;

    expect(compareCalendarDates(start, end)).toBeLessThan(0);
    expect(formatCalendarDate(addCalendarDays(start, 2))).toBe('2024-05-03');
    expect(calendarDateRange(start, end).map(formatCalendarDate)).toEqual([
      '2024-05-01',
      '2024-05-02',
      '2024-05-03',
    ]);
  });

  it('builds a Monday-first 42-cell May 2024 grid', () => {
    const grid = createCalendarMonthGrid(new Date(2024, 4, 1));

    expect(grid.days).toHaveLength(42);
    expect(formatCalendarDate(grid.days[2]!.date)).toBe('2024-05-01');
    expect(grid.days[2]!.inMonth).toBe(true);
    expect(grid.days[1]!.inMonth).toBe(false);
  });

  it('returns source lunar labels only in its supported date interval', () => {
    expect(getCalendarLunarLabel(new Date(2024, 1, 10))).toBe('正月');
    expect(getCalendarLunarLabel(new Date(2024, 1, 11))).toBe('初二');
    expect(getCalendarLunarLabel(new Date(1899, 11, 31))).toBeNull();
  });
});
