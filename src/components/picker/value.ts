import type {
  UPPickerChangePayload,
  UPPickerColumns,
  UPPickerConfirmPayload,
  UPPickerOption,
  UPPickerPrimitive,
} from './types';

function isOptionObject(option: UPPickerOption): option is Record<string, unknown> {
  return typeof option === 'object' && option !== null;
}

export function clonePickerColumns(columns: UPPickerColumns): UPPickerColumns {
  return columns.map((column) => [...column]);
}

export function optionText(option: UPPickerOption, keyName: string): string {
  return isOptionObject(option) ? String(option[keyName] ?? '') : String(option);
}

export function optionValue(option: UPPickerOption, valueName: string): UPPickerPrimitive {
  return isOptionObject(option) ? option[valueName] as UPPickerPrimitive : option;
}

export function normalizePickerIndexes(
  columns: UPPickerColumns,
  indexes: readonly number[],
): number[] {
  return columns.map((column, index) => {
    if (!column.length) return 0;
    const requested = Math.trunc(indexes[index] ?? 0);
    return Math.max(0, Math.min(column.length - 1, requested));
  });
}

function indexesForModelValue(
  columns: UPPickerColumns,
  modelValue: readonly UPPickerPrimitive[],
  valueName: string,
): number[] | null {
  if (modelValue.length !== columns.length) return null;
  const indexes = columns.map((column, index) => (
    column.findIndex((option) => optionValue(option, valueName) === modelValue[index])
  ));
  return indexes.every((index) => index >= 0) ? indexes : null;
}

export function resolvePickerIndexes(
  columns: UPPickerColumns,
  modelValue: readonly UPPickerPrimitive[] | undefined,
  defaultIndex: readonly number[] | undefined,
  valueName: string,
): number[] {
  const modelIndexes = modelValue === undefined
    ? null
    : indexesForModelValue(columns, modelValue, valueName);
  if (modelIndexes) return normalizePickerIndexes(columns, modelIndexes);
  return normalizePickerIndexes(columns, defaultIndex ?? []);
}

export function pickerSelectedValues(
  columns: UPPickerColumns,
  indexes: readonly number[],
): UPPickerOption[] {
  const normalized = normalizePickerIndexes(columns, indexes);
  return columns.map((column, index) => column[normalized[index]]).filter(
    (option): option is UPPickerOption => option !== undefined,
  );
}

export function pickerPrimitiveValues(
  columns: UPPickerColumns,
  indexes: readonly number[],
  valueName: string,
): UPPickerPrimitive[] {
  return pickerSelectedValues(columns, indexes).map((option) => optionValue(option, valueName));
}

export function pickerDisplay(
  columns: UPPickerColumns,
  indexes: readonly number[],
  keyName: string,
): string {
  return pickerSelectedValues(columns, indexes).map((option) => optionText(option, keyName)).join('/');
}

export function pickerChangePayload(
  columns: UPPickerColumns,
  indexes: readonly number[],
  columnIndex: number,
): UPPickerChangePayload {
  const normalized = normalizePickerIndexes(columns, indexes);
  return {
    columnIndex,
    index: normalized[columnIndex] ?? 0,
    indexs: normalized,
    value: pickerSelectedValues(columns, normalized),
    values: columns,
  };
}

export function pickerConfirmPayload(
  columns: UPPickerColumns,
  indexes: readonly number[],
): UPPickerConfirmPayload {
  const normalized = normalizePickerIndexes(columns, indexes);
  return {
    indexs: normalized,
    value: pickerSelectedValues(columns, normalized),
    values: columns,
  };
}
