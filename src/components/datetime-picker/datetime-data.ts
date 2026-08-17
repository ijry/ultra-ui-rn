import type {
  UPDatetimePickerColumnType,
  UPDatetimePickerDataOptions,
  UPDatetimePickerMode,
  UPDatetimePickerOption,
  UPDatetimePickerState,
  UPDatetimePickerValue,
} from './types';

const sourceFormats: Record<UPDatetimePickerMode, string> = {
  date: 'YYYY-MM-DD',
  datehour: 'YYYY-MM-DD HH',
  datetime: 'YYYY-MM-DD HH:mm',
  datetimesecond: 'YYYY-MM-DD HH:mm:ss',
  time: 'HH:mm',
  timesecond: 'HH:mm:ss',
  'year-month': 'YYYY-MM',
};

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const dateModes: readonly UPDatetimePickerMode[] = [
  'date', 'year-month', 'datetime', 'datehour', 'datetimesecond',
];

function isDateMode(mode: UPDatetimePickerMode): boolean {
  return dateModes.includes(mode);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function whole(value: number | undefined, fallback: number): number {
  const number = Math.trunc(Number(value));
  return Number.isFinite(number) ? number : fallback;
}

function dateValue(value: unknown): Date | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateBounds(input: UPDatetimePickerDataOptions): { min: Date; max: Date } {
  const now = new Date();
  const fallbackMin = new Date(now.getFullYear() - 10, 0, 1);
  const fallbackMax = new Date(now.getFullYear() + 10, 0, 1);
  const first = dateValue(input.minDate) ?? fallbackMin;
  const second = dateValue(input.maxDate) ?? fallbackMax;
  return first.getTime() <= second.getTime() ? { min: first, max: second } : { min: second, max: first };
}

function rangeBounds(minimum: number | undefined, maximum: number | undefined, fallbackMin: number, fallbackMax: number) {
  const first = clamp(whole(minimum, fallbackMin), fallbackMin, fallbackMax);
  const second = clamp(whole(maximum, fallbackMax), fallbackMin, fallbackMax);
  return first <= second ? { min: first, max: second } : { min: second, max: first };
}

function parseTime(value: unknown): Pick<DateParts, 'hour' | 'minute' | 'second'> | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]), second: Number(match[3] ?? 0) };
}

function dateParts(value: UPDatetimePickerValue | null | undefined, bounds: { min: Date; max: Date }): DateParts {
  const input = dateValue(value);
  const time = clamp(input?.getTime() ?? bounds.min.getTime(), bounds.min.getTime(), bounds.max.getTime());
  const date = new Date(time);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

function timeParts(value: UPDatetimePickerValue | null | undefined, input: UPDatetimePickerDataOptions): DateParts {
  const hours = rangeBounds(input.minHour, input.maxHour, 0, 23);
  const minutes = rangeBounds(input.minMinute, input.maxMinute, 0, 59);
  const seconds = rangeBounds(input.minSecond, input.maxSecond, 0, 59);
  const time = parseTime(value);
  return {
    year: 1970,
    month: 1,
    day: 1,
    hour: clamp(time?.hour ?? hours.min, hours.min, hours.max),
    minute: clamp(time?.minute ?? minutes.min, minutes.min, minutes.max),
    second: clamp(time?.second ?? seconds.min, seconds.min, seconds.max),
  };
}

function includedTypes(mode: UPDatetimePickerMode): readonly UPDatetimePickerColumnType[] {
  if (mode === 'time') return ['hour', 'minute'];
  if (mode === 'timesecond') return ['hour', 'minute', 'second'];
  if (mode === 'year-month') return ['year', 'month'];
  if (mode === 'date') return ['year', 'month', 'day'];
  if (mode === 'datehour') return ['year', 'month', 'day', 'hour'];
  if (mode === 'datetime') return ['year', 'month', 'day', 'hour', 'minute'];
  return ['year', 'month', 'day', 'hour', 'minute', 'second'];
}

function maxDay(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function rawRange(type: UPDatetimePickerColumnType, parts: DateParts, input: UPDatetimePickerDataOptions): { min: number; max: number } {
  if (!isDateMode(input.mode ?? 'datetime')) {
    if (type === 'hour') return rangeBounds(input.minHour, input.maxHour, 0, 23);
    if (type === 'minute') return rangeBounds(input.minMinute, input.maxMinute, 0, 59);
    return rangeBounds(input.minSecond, input.maxSecond, 0, 59);
  }

  const bounds = dateBounds(input);
  const min = bounds.min;
  const max = bounds.max;
  if (type === 'year') return { min: min.getFullYear(), max: max.getFullYear() };
  if (type === 'month') {
    return {
      min: parts.year === min.getFullYear() ? min.getMonth() + 1 : 1,
      max: parts.year === max.getFullYear() ? max.getMonth() + 1 : 12,
    };
  }
  if (type === 'day') {
    const monthMaximum = maxDay(parts.year, parts.month);
    return {
      min: parts.year === min.getFullYear() && parts.month === min.getMonth() + 1 ? min.getDate() : 1,
      max: parts.year === max.getFullYear() && parts.month === max.getMonth() + 1 ? max.getDate() : monthMaximum,
    };
  }
  if (type === 'hour') {
    const minDate = min.getFullYear() === parts.year && min.getMonth() + 1 === parts.month && min.getDate() === parts.day;
    const maxDate = max.getFullYear() === parts.year && max.getMonth() + 1 === parts.month && max.getDate() === parts.day;
    return { min: minDate ? min.getHours() : 0, max: maxDate ? max.getHours() : 23 };
  }
  if (type === 'minute') {
    const minTime = min.getFullYear() === parts.year && min.getMonth() + 1 === parts.month && min.getDate() === parts.day && min.getHours() === parts.hour;
    const maxTime = max.getFullYear() === parts.year && max.getMonth() + 1 === parts.month && max.getDate() === parts.day && max.getHours() === parts.hour;
    return { min: minTime ? min.getMinutes() : 0, max: maxTime ? max.getMinutes() : 59 };
  }
  const minTime = min.getFullYear() === parts.year && min.getMonth() + 1 === parts.month && min.getDate() === parts.day && min.getHours() === parts.hour && min.getMinutes() === parts.minute;
  const maxTime = max.getFullYear() === parts.year && max.getMonth() + 1 === parts.month && max.getDate() === parts.day && max.getHours() === parts.hour && max.getMinutes() === parts.minute;
  return { min: minTime ? min.getSeconds() : 0, max: maxTime ? max.getSeconds() : 59 };
}

function numberFromText(value: string): number | null {
  const match = /\d+/.exec(value);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
}

function createColumn(type: UPDatetimePickerColumnType, parts: DateParts, input: UPDatetimePickerDataOptions): UPDatetimePickerOption[] {
  const bounds = rawRange(type, parts, input);
  const values = Array.from({ length: bounds.max - bounds.min + 1 }, (_value, index) => {
    const number = bounds.min + index;
    return type === 'year' ? String(number) : pad(number);
  });
  const filtered = input.filter?.(type, values);
  const visible = Array.isArray(filtered) && filtered.length ? filtered : values;
  return visible
    .map((raw) => {
      const value = numberFromText(String(raw));
      return value === null ? null : {
        text: input.formatter?.(type, String(raw)) ?? String(raw),
        type,
        value,
      };
    })
    .filter((option): option is UPDatetimePickerOption => option !== null);
}

function closestIndex(options: readonly UPDatetimePickerOption[], value: number): number {
  const exact = options.findIndex((option) => option.value === value);
  if (exact >= 0) return exact;
  let index = 0;
  let distance = Number.POSITIVE_INFINITY;
  options.forEach((option, optionIndex) => {
    const nextDistance = Math.abs(option.value - value);
    if (nextDistance < distance) {
      index = optionIndex;
      distance = nextDistance;
    }
  });
  return index;
}

function setPart(parts: DateParts, type: UPDatetimePickerColumnType, value: number): DateParts {
  return { ...parts, [type]: value };
}

function normalizeDateParts(parts: DateParts, input: UPDatetimePickerDataOptions): DateParts {
  const bounds = dateBounds(input);
  const raw = new Date(parts.year, parts.month - 1, Math.min(parts.day, maxDay(parts.year, parts.month)), parts.hour, parts.minute, parts.second);
  const date = new Date(clamp(raw.getTime(), bounds.min.getTime(), bounds.max.getTime()));
  return {
    year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(),
    hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds(),
  };
}

function outputValue(parts: DateParts, input: UPDatetimePickerDataOptions): UPDatetimePickerValue {
  const mode = input.mode ?? 'datetime';
  if (isDateMode(mode)) {
    const normalized = normalizeDateParts(parts, input);
    return new Date(normalized.year, normalized.month - 1, normalized.day, normalized.hour, normalized.minute, normalized.second).getTime();
  }
  return mode === 'timesecond'
    ? `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`
    : `${pad(parts.hour)}:${pad(parts.minute)}`;
}

function selectedParts(columns: readonly (readonly UPDatetimePickerOption[])[], indexs: readonly number[], fallback: DateParts): DateParts {
  return columns.reduce((parts, column, index) => {
    const option = column[indexs[index] ?? 0] ?? column[0];
    return option ? setPart(parts, option.type, option.value) : parts;
  }, fallback);
}

export function createDatetimePickerState(input: UPDatetimePickerDataOptions): UPDatetimePickerState {
  const mode = input.mode ?? 'datetime';
  let parts = isDateMode(mode) ? dateParts(input.value, dateBounds(input)) : timeParts(input.value, input);
  let columns: readonly (readonly UPDatetimePickerOption[])[] = [];
  let indexs: readonly number[] = [];

  for (let iteration = 0; iteration < 3; iteration += 1) {
    columns = includedTypes(mode).map((type) => createColumn(type, parts, { ...input, mode }));
    indexs = columns.map((column) => closestIndex(column, parts[column[0]?.type ?? 'year']));
    parts = selectedParts(columns, indexs, parts);
    if (isDateMode(mode)) parts = normalizeDateParts(parts, { ...input, mode });
  }

  return { columns, indexs, value: outputValue(parts, { ...input, mode }) };
}

export function changeDatetimePickerState(
  state: UPDatetimePickerState,
  columnIndex: number,
  optionIndex: number,
  input: UPDatetimePickerDataOptions,
): UPDatetimePickerState {
  const mode = input.mode ?? 'datetime';
  const initial = isDateMode(mode) ? dateParts(state.value, dateBounds(input)) : timeParts(state.value, input);
  const option = state.columns[columnIndex]?.[optionIndex];
  const next = option ? setPart(initial, option.type, option.value) : initial;
  return createDatetimePickerState({ ...input, mode, value: outputValue(next, { ...input, mode }) });
}

export function formatDatetimePickerValue(
  value: UPDatetimePickerValue | null | undefined,
  mode: UPDatetimePickerMode,
  format?: string,
): string {
  let parts: DateParts;
  if (isDateMode(mode)) {
    const date = dateValue(value);
    if (!date) return '';
    parts = {
      year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(),
      hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds(),
    };
  } else {
    const time = parseTime(value);
    if (!time) return '';
    parts = { year: 1970, month: 1, day: 1, ...time };
  }

  const replacements: Record<string, string> = {
    YYYY: String(parts.year), MM: pad(parts.month), DD: pad(parts.day),
    HH: pad(parts.hour), mm: pad(parts.minute), ss: pad(parts.second),
  };
  return (format || sourceFormats[mode]).replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => replacements[token] ?? token);
}
