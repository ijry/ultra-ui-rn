import {
  calendarDateRange,
  compareCalendarDates,
  formatCalendarDate,
  getCalendarLunarLabel,
  isCalendarDateBetween,
  normalizeCalendarDate,
  type UPCalendarDateInput,
} from '../../utils/calendar';
import type {
  UPCalendarDay,
  UPCalendarDayCustom,
  UPCalendarMode,
  UPCalendarRangeResultMode,
} from './types';

export type UPCalendarSelection = readonly string[];
export type UPCalendarSelectionReason = 'selected' | 'readonly' | 'disabled' | 'forbidden' | 'max-range' | 'max-count' | 'same-day';

export type UPCalendarSelectionResult = {
  selection: UPCalendarSelection;
  reason: UPCalendarSelectionReason;
};

export type UPCalendarSelectionOptions = {
  mode: UPCalendarMode;
  readonly: boolean;
  disabled: boolean;
  forbidden: boolean;
  maxCount: number;
  maxRange: number;
  allowSameDay: boolean;
};

export function createCalendarDay(
  date: Date,
  options: { disabled: boolean; showLunar: boolean },
): UPCalendarDay {
  return {
    date,
    day: date.getDate(),
    week: date.getDay(),
    month: date.getMonth() + 1,
    disabled: options.disabled,
    bottomInfo: options.showLunar ? getCalendarLunarLabel(date) ?? '' : '',
    dot: false,
  };
}

export function mergeCalendarDay(
  day: UPCalendarDay,
  customList: readonly UPCalendarDayCustom[],
  formatter?: ((value: UPCalendarDay) => UPCalendarDay) | null,
): UPCalendarDay {
  const dateKey = formatCalendarDate(day.date);
  const custom = customList.find((item) => {
    const customDate = normalizeCalendarDate(item.date);
    return customDate ? formatCalendarDate(customDate) === dateKey : false;
  });
  const merged = custom ? { ...day, ...custom, date: day.date } : day;
  return formatter ? formatter(merged) : merged;
}

function uniqueDateStrings(values: readonly UPCalendarDateInput[], minDate: Date | null, maxDate: Date | null): string[] {
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const date = normalizeCalendarDate(value);
    if (!date || !isCalendarDateBetween(date, minDate, maxDate)) return [];
    const key = formatCalendarDate(date);
    if (seen.has(key)) return [];
    seen.add(key);
    return [key];
  });
}

export function resolveCalendarDefaultSelection(options: {
  mode: UPCalendarMode;
  defaultDate?: UPCalendarDateInput | readonly UPCalendarDateInput[] | null;
  minDate: Date | null;
  maxDate: Date | null;
  fallbackDate: Date;
}): UPCalendarSelection {
  const source = options.defaultDate === null || options.defaultDate === undefined
    ? []
    : Array.isArray(options.defaultDate) ? options.defaultDate : [options.defaultDate];
  const values = uniqueDateStrings(source, options.minDate, options.maxDate);
  const fallback = isCalendarDateBetween(options.fallbackDate, options.minDate, options.maxDate)
    ? formatCalendarDate(options.fallbackDate)
    : null;

  if (options.mode === 'single') return values.slice(0, 1).length ? values.slice(0, 1) : fallback ? [fallback] : [];
  if (options.mode === 'multiple') return Array.isArray(options.defaultDate) ? values : fallback ? [fallback] : [];
  if (!Array.isArray(options.defaultDate)) return fallback ? [fallback] : [];
  if (values.length < 2) return values;
  const first = normalizeCalendarDate(values[0])!;
  const last = normalizeCalendarDate(values[values.length - 1])!;
  return compareCalendarDates(first, last) <= 0 ? [values[0]!, values[values.length - 1]!] : [values[values.length - 1]!, values[0]!];
}

export function selectCalendarDate(
  selection: UPCalendarSelection,
  date: Date,
  options: UPCalendarSelectionOptions,
): UPCalendarSelectionResult {
  if (options.readonly) return { selection, reason: 'readonly' };
  if (options.disabled) return { selection, reason: 'disabled' };
  if (options.forbidden && options.mode !== 'range') return { selection, reason: 'forbidden' };

  const dateKey = formatCalendarDate(date);
  if (options.mode === 'single') return { selection: [dateKey], reason: 'selected' };
  if (options.mode === 'multiple') {
    const selectedIndex = selection.indexOf(dateKey);
    if (selectedIndex >= 0) return { selection: selection.filter((value) => value !== dateKey), reason: 'selected' };
    if (selection.length >= options.maxCount) return { selection, reason: 'max-count' };
    return { selection: [...selection, dateKey], reason: 'selected' };
  }

  if (selection.length === 0 || selection.length >= 2) return { selection: [dateKey], reason: 'selected' };
  const start = normalizeCalendarDate(selection[0]);
  if (!start) return { selection: [dateKey], reason: 'selected' };
  const comparison = compareCalendarDates(date, start);
  if (comparison < 0) return { selection: [dateKey], reason: 'selected' };
  if (comparison === 0 && !options.allowSameDay) return { selection, reason: 'same-day' };
  const distance = calendarDateRange(start, date).length - 1;
  if (distance > options.maxRange) return { selection, reason: 'max-range' };
  return { selection: [selection[0]!, dateKey], reason: 'selected' };
}

export function isCalendarSelectionConfirmable(selection: UPCalendarSelection, mode: UPCalendarMode): boolean {
  if (mode === 'range') return selection.length >= 2;
  return selection.length > 0;
}

export function resultCalendarDates(
  selection: UPCalendarSelection,
  mode: UPCalendarMode,
  rangeResultMode: UPCalendarRangeResultMode,
): string[] {
  if (mode !== 'range' || selection.length < 2) return [...selection];
  if (rangeResultMode === 'boundary') return [selection[0]!, selection[1]!];
  const start = normalizeCalendarDate(selection[0]);
  const end = normalizeCalendarDate(selection[1]);
  return start && end ? calendarDateRange(start, end).map(formatCalendarDate) : [];
}

export function isCalendarDateSelected(date: Date, selection: UPCalendarSelection, mode: UPCalendarMode): boolean {
  const key = formatCalendarDate(date);
  if (mode !== 'range' || selection.length < 2) return selection.includes(key);
  const start = normalizeCalendarDate(selection[0]);
  const end = normalizeCalendarDate(selection[1]);
  return Boolean(start && end && compareCalendarDates(date, start) >= 0 && compareCalendarDates(date, end) <= 0);
}
