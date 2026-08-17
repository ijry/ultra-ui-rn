export type UPCalendarDateInput = string | number | Date;

export type UPCalendarMonthGridDay = {
  date: Date;
  inMonth: boolean;
  week: number;
};

export type UPCalendarMonthGrid = {
  month: Date;
  days: readonly UPCalendarMonthGridDay[];
};

const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6,
  0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50,
  0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60,
  0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2,
  0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5,
  0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0,
  0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58,
  0x05ac0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0,
  0x092d0, 0x0cab5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3,
  0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0,
  0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6,
  0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0,
  0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, 0x0e968, 0x0d520,
  0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, 0x0d520,
] as const;

const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'] as const;
const lunarDays = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const;
const lunarPrefixes = ['初', '十', '廿', '卅'] as const;
const lunarStart = new Date(1900, 0, 31);
const lunarEnd = new Date(2100, 11, 31);

export function startOfCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function normalizeCalendarDate(input: UPCalendarDateInput | null | undefined): Date | null {
  if (typeof input === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return formatCalendarDate(date) === input ? date : null;
  }

  const value = input instanceof Date ? input.getTime() : input;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : startOfCalendarDay(date);
}

export function formatCalendarDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatCalendarMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function compareCalendarDates(left: Date, right: Date): number {
  return startOfCalendarDay(left).getTime() - startOfCalendarDay(right).getTime();
}

export function addCalendarDays(date: Date, amount: number): Date {
  const result = startOfCalendarDay(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addCalendarMonths(date: Date, amount: number): Date {
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export function clampCalendarDate(date: Date, minDate?: Date | null, maxDate?: Date | null): Date {
  if (minDate && compareCalendarDates(date, minDate) < 0) return startOfCalendarDay(minDate);
  if (maxDate && compareCalendarDates(date, maxDate) > 0) return startOfCalendarDay(maxDate);
  return startOfCalendarDay(date);
}

export function isCalendarDateBetween(date: Date, minDate?: Date | null, maxDate?: Date | null): boolean {
  return (!minDate || compareCalendarDates(date, minDate) >= 0)
    && (!maxDate || compareCalendarDates(date, maxDate) <= 0);
}

export function calendarDateRange(start: Date, end: Date): Date[] {
  if (compareCalendarDates(start, end) > 0) return [];
  const result: Date[] = [];
  for (let date = startOfCalendarDay(start); compareCalendarDates(date, end) <= 0; date = addCalendarDays(date, 1)) {
    result.push(date);
  }
  return result;
}

export function createCalendarMonthGrid(month: Date): UPCalendarMonthGrid {
  const calendarMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayFirstOffset = (calendarMonth.getDay() + 6) % 7;
  const firstGridDay = addCalendarDays(calendarMonth, -mondayFirstOffset);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = addCalendarDays(firstGridDay, index);
    return {
      date,
      inMonth: date.getMonth() === calendarMonth.getMonth(),
      week: (date.getDay() + 6) % 7,
    };
  });

  return { month: calendarMonth, days };
}

export function createCalendarMonths(
  startDate?: Date | null,
  endDate?: Date | null,
  fallbackMonthCount = 3,
): Date[] {
  const today = startOfCalendarDay(new Date());
  const firstMonth = new Date((startDate ?? today).getFullYear(), (startDate ?? today).getMonth(), 1);
  const lastMonth = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    : new Date(firstMonth.getFullYear(), firstMonth.getMonth() + Math.max(1, fallbackMonthCount) - 1, 1);
  const months: Date[] = [];

  for (let month = firstMonth; compareCalendarDates(month, lastMonth) <= 0; month = new Date(month.getFullYear(), month.getMonth() + 1, 1)) {
    months.push(month);
  }
  return months;
}

function lunarYearDays(year: number): number {
  const info = lunarInfo[year - 1900];
  if (info === undefined) return 0;
  let days = 348;
  for (let mask = 0x8000; mask > 0x8; mask >>= 1) {
    if (info & mask) days += 1;
  }
  return days + lunarLeapDays(year);
}

function lunarLeapMonth(year: number): number {
  return (lunarInfo[year - 1900] ?? 0) & 0xf;
}

function lunarLeapDays(year: number): number {
  const info = lunarInfo[year - 1900] ?? 0;
  return lunarLeapMonth(year) === 0 ? 0 : (info & 0x10000 ? 30 : 29);
}

function lunarMonthDays(year: number, month: number): number {
  const info = lunarInfo[year - 1900] ?? 0;
  return info & (0x10000 >> month) ? 30 : 29;
}

function lunarDayLabel(day: number): string {
  if (day === 10) return '初十';
  if (day === 20) return '二十';
  if (day === 30) return '三十';
  return `${lunarPrefixes[Math.floor(day / 10)]}${lunarDays[day % 10]}`;
}

export function getCalendarLunarLabel(date: Date): string | null {
  const solarDate = startOfCalendarDay(date);
  if (compareCalendarDates(solarDate, lunarStart) < 0 || compareCalendarDates(solarDate, lunarEnd) > 0) return null;

  let offset = Math.floor((Date.UTC(solarDate.getFullYear(), solarDate.getMonth(), solarDate.getDate())
    - Date.UTC(1900, 0, 31)) / 86_400_000);
  let lunarYear = 1900;
  while (lunarYear <= 2100) {
    const days = lunarYearDays(lunarYear);
    if (offset < days) break;
    offset -= days;
    lunarYear += 1;
  }

  const leapMonth = lunarLeapMonth(lunarYear);
  let lunarMonth = 1;
  let isLeapMonth = false;
  while (lunarMonth <= 12) {
    const days = isLeapMonth ? lunarLeapDays(lunarYear) : lunarMonthDays(lunarYear, lunarMonth);
    if (offset < days) break;
    offset -= days;
    if (leapMonth === lunarMonth && !isLeapMonth) {
      isLeapMonth = true;
    } else {
      if (isLeapMonth) isLeapMonth = false;
      lunarMonth += 1;
    }
  }

  const lunarDay = offset + 1;
  if (lunarDay === 1) return `${isLeapMonth ? '闰' : ''}${lunarMonths[lunarMonth - 1]}月`;
  return lunarDayLabel(lunarDay);
}
