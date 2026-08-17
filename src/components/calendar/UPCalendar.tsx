import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { toast } from '../../feedback';
import {
  compareCalendarDates,
  createCalendarMonthGrid,
  createCalendarMonths,
  formatCalendarDate,
  formatCalendarMonth,
  getPx,
  isCalendarDateBetween,
  normalizeCalendarDate,
} from '../../utils';
import { UPPopup } from '../popup';
import { UPSafeBottom } from '../safe-bottom';
import {
  createCalendarDay,
  isCalendarDateSelected,
  isCalendarSelectionConfirmable,
  mergeCalendarDay,
  resolveCalendarDefaultSelection,
  resultCalendarDates,
  selectCalendarDate,
  type UPCalendarSelection,
} from './calendar-data';
import { UPCalendarTimePicker, type UPCalendarTimeValue } from './UPCalendarTimePicker';
import type { UPCalendarProps } from './types';

export type { UPCalendarProps } from './types';

function numericValue(value: number | string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalDate(value: unknown): Date | null {
  return value === 0 || value === '' || value === null || value === undefined
    ? null
    : normalizeCalendarDate(value as string | number | Date);
}

function isSameDate(date: Date, other: Date): boolean {
  return compareCalendarDates(date, other) === 0;
}

function parseCalendarTime(value: string | undefined): UPCalendarTimeValue {
  const parts = (value ?? '').split(':');
  const parse = (index: number, maximum: number) => {
    const parsed = Number(parts[index] ?? 0);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(maximum, Math.trunc(parsed))) : 0;
  };
  return { hour: parse(0, 23), minute: parse(1, 59), second: parse(2, 59) };
}

function formatCalendarTime(value: UPCalendarTimeValue, precision: NonNullable<UPCalendarProps['timePrecision']>): string {
  const parts = [String(value.hour).padStart(2, '0')];
  if (precision !== 'hour') parts.push(String(value.minute).padStart(2, '0'));
  if (precision === 'second') parts.push(String(value.second).padStart(2, '0'));
  return parts.join(':');
}

function calendarTimeSeconds(value: UPCalendarTimeValue, precision: NonNullable<UPCalendarProps['timePrecision']>): number {
  return value.hour * 3600 + (precision === 'hour' ? 0 : value.minute * 60) + (precision === 'second' ? value.second : 0);
}

export function UPCalendar(input: UPCalendarProps): React.JSX.Element | null {
  const config = useUPConfig();
  const props = { ...config.props.calendar, ...input } as unknown as Required<Pick<UPCalendarProps,
    'title' | 'showTitle' | 'showSubtitle' | 'mode' | 'startText' | 'endText' | 'customList' | 'color'
    | 'maxCount' | 'rowHeight' | 'showLunar' | 'showMark' | 'confirmText' | 'confirmDisabledText'
    | 'show' | 'readonly' | 'showConfirm' | 'maxRange' | 'rangePrompt' | 'showRangePrompt' | 'allowSameDay'
    | 'rangeResultMode' | 'monthNum' | 'showToday' | 'todayColor' | 'weekText' | 'forbidDays'
  >> & UPCalendarProps;
  const minDate = optionalDate(props.minDate);
  const maxDate = optionalDate(props.maxDate);
  const generatedMonths = useMemo(
    () => createCalendarMonths(minDate, maxDate, Math.max(1, Math.trunc(numericValue(props.monthNum, 3)))),
    [maxDate?.getTime(), minDate?.getTime(), props.monthNum],
  );
  const fallbackDate = new Date();
  const defaultSelection = useMemo(() => resolveCalendarDefaultSelection({
    mode: props.mode,
    defaultDate: props.defaultDate,
    minDate,
    maxDate,
    fallbackDate,
  }), [input.defaultDate, maxDate?.getTime(), minDate?.getTime(), props.mode]);
  const [selection, setSelection] = useState<UPCalendarSelection>(defaultSelection);
  const parsedDefaultTime = parseCalendarTime(props.defaultTime);
  const [singleTime, setSingleTime] = useState<UPCalendarTimeValue>(parsedDefaultTime);
  const [rangeStartTime, setRangeStartTime] = useState<UPCalendarTimeValue>(parsedDefaultTime);
  const [rangeEndTime, setRangeEndTime] = useState<UPCalendarTimeValue>(parsedDefaultTime);
  const [timePickerTarget, setTimePickerTarget] = useState<'single' | 'start' | 'end' | null>(null);
  const initialMonthIndex = Math.max(0, generatedMonths.findIndex((month) => {
    const selectedDate = normalizeCalendarDate(defaultSelection[0] ?? '');
    return selectedDate ? formatCalendarMonth(month) === formatCalendarMonth(selectedDate) : false;
  }));
  const [monthIndex, setMonthIndex] = useState(initialMonthIndex);

  useEffect(() => {
    setSelection(defaultSelection);
  }, [defaultSelection]);

  useEffect(() => {
    const value = parseCalendarTime(props.defaultTime);
    setSingleTime(value);
    setRangeStartTime(value);
    setRangeEndTime(value);
  }, [props.defaultTime]);

  useEffect(() => {
    setMonthIndex(initialMonthIndex);
  }, [initialMonthIndex]);

  const forbiddenDates = useMemo(() => new Set(
    (props.forbidDays ?? []).flatMap((value) => {
      const date = normalizeCalendarDate(value);
      return date ? [formatCalendarDate(date)] : [];
    }),
  ), [props.forbidDays]);
  const today = new Date();
  const rowHeight = Math.max(42, getPx(props.rowHeight));
  const maxCount = Math.max(0, Math.trunc(numericValue(props.maxCount, Number.MAX_SAFE_INTEGER)));
  const maxRange = Math.max(0, numericValue(props.maxRange, Number.MAX_SAFE_INTEGER));
  const timePrecision = props.timePrecision ?? 'minute';
  const showTimePanel = props.enableTime && (props.mode === 'single' || (props.mode === 'range' && props.rangeResultMode === 'boundary'));
  const sameDayRangeTimeInvalid = props.mode === 'range'
    && props.rangeResultMode === 'boundary'
    && selection.length >= 2
    && selection[0] === selection[1]
    && calendarTimeSeconds(rangeEndTime, timePrecision) < calendarTimeSeconds(rangeStartTime, timePrecision);
  const confirmable = isCalendarSelectionConfirmable(selection, props.mode) && !sameDayRangeTimeInvalid;
  const displayedMonths = props.monthSwitch ? (generatedMonths[monthIndex] ? [generatedMonths[monthIndex]!] : []) : generatedMonths;
  const displayedMonth = displayedMonths[0] ?? generatedMonths[0];

  const emitConfirm = (nextSelection = selection) => {
    if (!isCalendarSelectionConfirmable(nextSelection, props.mode)) return;
    const dates = resultCalendarDates(nextSelection, props.mode, props.rangeResultMode);
    if (showTimePanel && props.mode === 'single' && dates[0]) {
      input.onConfirm?.([`${dates[0]} ${formatCalendarTime(singleTime, timePrecision)}`]);
      return;
    }
    if (showTimePanel && props.mode === 'range' && props.rangeResultMode === 'boundary' && dates.length >= 2) {
      if (nextSelection[0] === nextSelection[1]
        && calendarTimeSeconds(rangeEndTime, timePrecision) < calendarTimeSeconds(rangeStartTime, timePrecision)) return;
      input.onConfirm?.([
        `${dates[0]} ${formatCalendarTime(rangeStartTime, timePrecision)}`,
        `${dates[1]} ${formatCalendarTime(rangeEndTime, timePrecision)}`,
      ]);
      return;
    }
    input.onConfirm?.(dates);
  };

  const selectDay = (date: Date, disabled: boolean, forbidden: boolean) => {
    const result = selectCalendarDate(selection, date, {
      mode: props.mode,
      readonly: props.readonly,
      disabled,
      forbidden,
      maxCount,
      maxRange,
      allowSameDay: props.allowSameDay,
    });
    if (result.reason === 'forbidden') {
      toast.default(props.forbidDaysToast ?? '此日期不可选');
      return;
    }
    if (result.reason === 'max-range') {
      if (props.showRangePrompt) {
        toast.default(props.rangePrompt || `最多可选择${maxRange}天`);
      }
      return;
    }
    if (result.reason !== 'selected') return;
    setSelection(result.selection);
    if (!props.showConfirm && isCalendarSelectionConfirmable(result.selection, props.mode)) {
      emitConfirm(result.selection);
    }
  };

  const jumpToToday = () => {
    if (!isCalendarDateBetween(today, minDate, maxDate)) return;
    const index = generatedMonths.findIndex((month) => formatCalendarMonth(month) === formatCalendarMonth(today));
    if (index >= 0) setMonthIndex(index);
    if (props.mode !== 'range') selectDay(today, false, false);
  };

  if (!props.show) return null;

  const content = (
    <View style={[{ backgroundColor: props.bgColor || '#ffffff' }, input.customStyle]} testID="up-calendar-content">
      {props.showTitle || props.showSubtitle || props.monthSwitch || props.showToday ? (
        <View style={{ alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
          {props.showTitle ? <Text style={{ color: '#303133', fontSize: 18, fontWeight: '600' }}>{props.title}</Text> : null}
          {props.showSubtitle && displayedMonth ? (
            <Text style={{ color: '#606266', fontSize: 14, marginTop: props.showTitle ? 5 : 0 }}>
              {`${formatCalendarMonth(displayedMonth).replace('-', '年')}月`}
            </Text>
          ) : null}
          {props.monthSwitch || props.showToday ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              {props.monthSwitch ? (
                <Pressable
                  accessibilityLabel="Previous month"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: monthIndex <= 0 }}
                  disabled={monthIndex <= 0}
                  onPress={() => setMonthIndex((index) => Math.max(0, index - 1))}
                  style={{ minWidth: 72, padding: 6 }}
                  testID="up-calendar-prev"
                ><Text style={{ color: monthIndex <= 0 ? '#c8c9cc' : props.color, textAlign: 'center' }}>上月</Text></Pressable>
              ) : null}
              {props.showToday ? <Pressable accessibilityRole="button" onPress={jumpToToday} style={{ minWidth: 72, padding: 6 }} testID="up-calendar-today"><Text style={{ color: props.color, textAlign: 'center' }}>今天</Text></Pressable> : null}
              {props.monthSwitch ? (
                <Pressable
                  accessibilityLabel="Next month"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: monthIndex >= generatedMonths.length - 1 }}
                  disabled={monthIndex >= generatedMonths.length - 1}
                  onPress={() => setMonthIndex((index) => Math.min(generatedMonths.length - 1, index + 1))}
                  style={{ minWidth: 72, padding: 6 }}
                  testID="up-calendar-next"
                ><Text style={{ color: monthIndex >= generatedMonths.length - 1 ? '#c8c9cc' : props.color, textAlign: 'center' }}>下月</Text></Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
      {showTimePanel ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }} testID="up-calendar-time-panel">
          {props.mode === 'single' ? (
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
              <Text style={{ color: '#303133', fontSize: 13 }}>{selection[0] ?? '--'}</Text>
              <Pressable accessibilityRole="button" onPress={() => setTimePickerTarget('single')} style={{ borderColor: '#dcdfe6', borderRadius: 15, borderWidth: 1, minWidth: 88, paddingHorizontal: 10, paddingVertical: 5 }} testID="up-calendar-time-single"><Text style={{ color: '#303133', textAlign: 'center' }}>{formatCalendarTime(singleTime, timePrecision)}</Text></Pressable>
            </View>
          ) : (
            <>
              <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                <Text style={{ color: '#303133', fontSize: 13 }}>{selection[0] ?? '--'}</Text>
                <Pressable accessibilityRole="button" onPress={() => setTimePickerTarget('start')} style={{ borderColor: '#dcdfe6', borderRadius: 15, borderWidth: 1, minWidth: 88, paddingHorizontal: 10, paddingVertical: 5 }} testID="up-calendar-time-start"><Text style={{ color: '#303133', textAlign: 'center' }}>{formatCalendarTime(rangeStartTime, timePrecision)}</Text></Pressable>
              </View>
              <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                <Text style={{ color: '#303133', fontSize: 13 }}>{selection.length >= 2 ? selection[1] : '--'}</Text>
                <Pressable accessibilityRole="button" onPress={() => setTimePickerTarget('end')} style={{ borderColor: '#dcdfe6', borderRadius: 15, borderWidth: 1, minWidth: 88, paddingHorizontal: 10, paddingVertical: 5 }} testID="up-calendar-time-end"><Text style={{ color: '#303133', textAlign: 'center' }}>{formatCalendarTime(rangeEndTime, timePrecision)}</Text></Pressable>
              </View>
            </>
          )}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, paddingTop: 12 }}>
        {props.weekText.map((week, index) => (
          <View key={`${week}-${index}`} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: index >= 5 ? '#fa3534' : '#909399', fontSize: 13 }}>{week}</Text>
          </View>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} testID="up-calendar-month-scroll">
        {displayedMonths.map((month, visibleIndex) => {
          const sourceMonthIndex = props.monthSwitch ? monthIndex : visibleIndex;
          const grid = createCalendarMonthGrid(month);
          return (
            <View key={formatCalendarMonth(month)} style={{ marginTop: visibleIndex === 0 ? 6 : 18, paddingHorizontal: 8 }} testID={`up-calendar-month-${sourceMonthIndex}`}>
              {visibleIndex > 0 ? <Text style={{ color: '#303133', fontSize: 15, fontWeight: '600', paddingVertical: 8, textAlign: 'center' }}>{formatCalendarMonth(month).replace('-', '年')}月</Text> : null}
              <View style={{ minHeight: rowHeight * 6, position: 'relative' }}>
                {props.showMark ? <Text pointerEvents="none" style={{ color: '#f5f6f8', fontSize: 140, fontWeight: '700', left: 0, position: 'absolute', right: 0, textAlign: 'center', top: rowHeight * 2 - 70 }}>{month.getMonth() + 1}</Text> : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {grid.days.map((gridDay) => {
                    const base = createCalendarDay(gridDay.date, {
                      disabled: !gridDay.inMonth || !isCalendarDateBetween(gridDay.date, minDate, maxDate),
                      showLunar: props.showLunar,
                    });
                    const day = mergeCalendarDay(base, props.customList, props.formatter);
                    const dateKey = formatCalendarDate(day.date);
                    const forbidden = props.mode !== 'range' && forbiddenDates.has(dateKey);
                    const selected = isCalendarDateSelected(day.date, selection, props.mode);
                    const firstRange = props.mode === 'range' && selection.length >= 1 && selection[0] === dateKey;
                    const lastRange = props.mode === 'range' && selection.length >= 2 && selection[1] === dateKey;
                    const inRange = selected && !firstRange && !lastRange;
                    const lowerLabel = firstRange
                      ? selection.length >= 2 && lastRange ? `${props.startText}/${props.endText}` : props.startText
                      : lastRange ? props.endText : day.bottomInfo;
                    const disabled = day.disabled || props.readonly;
                    const labelColor = disabled || forbidden ? '#c8c9cc' : selected ? '#ffffff' : isSameDate(day.date, today) ? props.todayColor || props.color : '#303133';
                    const testID = gridDay.inMonth ? `up-calendar-day-${dateKey.replaceAll('-', '')}` : `up-calendar-adjacent-${dateKey.replaceAll('-', '')}-${sourceMonthIndex}`;
                    return (
                      <View key={`${dateKey}-${sourceMonthIndex}`} style={{ height: rowHeight, padding: 2, width: '14.285714%' }}>
                        <Pressable
                          accessibilityLabel={dateKey}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: disabled || forbidden, selected }}
                          disabled={disabled}
                          onPress={() => selectDay(day.date, day.disabled, forbidden)}
                          style={{
                            alignItems: 'center',
                            backgroundColor: selected ? (inRange ? '#ecf5ff' : props.color) : 'transparent',
                            borderColor: isSameDate(day.date, today) && !selected ? props.todayColor || props.color : 'transparent',
                            borderRadius: selected && !inRange ? 4 : 0,
                            borderWidth: isSameDate(day.date, today) && !selected ? 1 : 0,
                            flex: 1,
                            justifyContent: 'center',
                            opacity: gridDay.inMonth ? 1 : 0.45,
                            position: 'relative',
                          }}
                          testID={testID}
                        >
                          <Text style={{ color: inRange ? props.color : labelColor, fontSize: 16 }}>{day.day}</Text>
                          {lowerLabel ? <Text style={{ color: inRange ? props.color : labelColor, fontSize: 10, marginTop: 2 }}>{lowerLabel}</Text> : null}
                          {day.dot ? <View style={{ backgroundColor: '#fa3534', borderRadius: 4, height: 7, position: 'absolute', right: 5, top: 8, width: 7 }} testID={`up-calendar-dot-${dateKey.replaceAll('-', '')}`} /> : null}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {props.showConfirm ? props.footer ?? (
        <View style={{ padding: 14 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !confirmable }}
            disabled={!confirmable}
            onPress={() => emitConfirm()}
            style={{ alignItems: 'center', backgroundColor: confirmable ? props.color : '#c8c9cc', borderRadius: 4, minHeight: 42, justifyContent: 'center' }}
            testID="up-calendar-confirm"
          >
            <Text style={{ color: '#ffffff', fontSize: 16 }}>{confirmable ? props.confirmText : props.confirmDisabledText}</Text>
          </Pressable>
        </View>
      ) : null}
      {props.safeAreaInsetBottom ? <UPSafeBottom /> : null}
      <UPCalendarTimePicker
        onChangeShow={(show) => { if (!show) setTimePickerTarget(null); }}
        onConfirm={(value) => {
          if (timePickerTarget === 'single') setSingleTime(value);
          if (timePickerTarget === 'start') setRangeStartTime(value);
          if (timePickerTarget === 'end') setRangeEndTime(value);
        }}
        precision={timePrecision}
        show={timePickerTarget !== null}
        value={timePickerTarget === 'start' ? rangeStartTime : timePickerTarget === 'end' ? rangeEndTime : singleTime}
      />
    </View>
  );

  if (props.pageInline) return <View testID="up-calendar">{content}</View>;
  return (
    <View testID="up-calendar">
      <UPPopup
        bgColor={props.bgColor}
        closeOnClickOverlay={props.closeOnClickOverlay}
        duration={props.duration}
        mode="bottom"
        onChangeShow={input.onChangeShow}
        onClose={input.onClose}
        overlay={props.overlay}
        overlayOpacity={props.overlayOpacity}
        overlayStyle={typeof props.overlayStyle === 'string' ? undefined : props.overlayStyle}
        round={props.round}
        safeAreaInsetBottom={false}
        safeAreaInsetTop={props.safeAreaInsetTop}
        show={props.show}
        zIndex={props.zIndex}
      >
        {content}
      </UPPopup>
    </View>
  );
}
