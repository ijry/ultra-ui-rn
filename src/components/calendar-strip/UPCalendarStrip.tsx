import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import {
  addCalendarDays,
  addCalendarMonths,
  clampCalendarDate,
  compareCalendarDates,
  formatCalendarDate,
  formatCalendarMonth,
  isCalendarDateBetween,
  normalizeCalendarDate,
  type UPCalendarDateInput,
} from '../../utils';
import { UPCalendar, type UPCalendarProps } from '../calendar';

export type UPCalendarStripScene = 'tap' | 'switch' | 'full';

export type UPCalendarStripChange = {
  date: string;
  month: string;
  scene: UPCalendarStripScene;
};

export type UPCalendarStripProps = {
  modelValue?: UPCalendarDateInput | null;
  minDate?: UPCalendarDateInput | null;
  maxDate?: UPCalendarDateInput | null;
  color?: string;
  weekText?: readonly string[];
  fullCalendar?: boolean;
  fullCalendarProps?: Partial<UPCalendarProps>;
  fullMonthNum?: number | string;
  pullDownThreshold?: number | string;
  collapseAfterSelect?: boolean;
  readonly?: boolean;
  showToday?: boolean;
  monthFormat?: string;
  expandHint?: string;
  collapseHint?: string;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onUpdateModelValue?: (date: string) => void;
  onChange?: (payload: UPCalendarStripChange) => void;
  onConfirm?: (payload: UPCalendarStripChange) => void;
  onMonthChange?: (payload: { month: string; scene: UPCalendarStripScene }) => void;
  onToggleFull?: (payload: { show: boolean; source: 'button' | 'hint' | 'pull-down' | 'pull-up' | 'auto' }) => void;
};

function optionalDate(value: unknown): Date | null {
  return value === 0 || value === '' || value === null || value === undefined
    ? null
    : normalizeCalendarDate(value as UPCalendarDateInput);
}

function numberValue(value: number | string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveStripDate(value: unknown, minDate: Date | null, maxDate: Date | null): Date | null {
  const parsed = optionalDate(value);
  if (parsed) return clampCalendarDate(parsed, minDate, maxDate);
  const today = new Date();
  return isCalendarDateBetween(today, minDate, maxDate) ? today : minDate ?? maxDate;
}

function daysForStrip(selectedDate: Date): Date[] {
  const mondayOffset = (selectedDate.getDay() + 6) % 7;
  const monday = addCalendarDays(selectedDate, -mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addCalendarDays(monday, index));
}

export type UPCalendarStripRef = {
  prevMonth: () => void;
  nextMonth: () => void;
  toggleFull: () => void;
};

export const UPCalendarStrip = forwardRef<UPCalendarStripRef, UPCalendarStripProps>(function UPCalendarStrip(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.calendarStrip, ...input } as UPCalendarStripProps;
  const minDate = optionalDate(props.minDate);
  const maxDate = optionalDate(props.maxDate);
  const controlled = input.modelValue !== undefined;
  const externalDate = controlled ? resolveStripDate(input.modelValue, minDate, maxDate) : null;
  const [innerDate, setInnerDate] = useState<Date | null>(() => resolveStripDate(props.modelValue, minDate, maxDate));
  const [showFull, setShowFull] = useState(false);
  const selectedDate = externalDate ?? innerDate;
  const threshold = Math.max(1, numberValue(props.pullDownThreshold, 40));

  useEffect(() => {
    if (externalDate) setInnerDate(externalDate);
  }, [externalDate?.getTime()]);

  const days = useMemo(() => selectedDate ? daysForStrip(selectedDate) : [], [selectedDate?.getTime()]);
  const emitSelection = (nextDate: Date, scene: UPCalendarStripScene) => {
    if (!selectedDate || props.readonly) return;
    const clamped = clampCalendarDate(nextDate, minDate, maxDate);
    const currentKey = formatCalendarDate(selectedDate);
    const nextKey = formatCalendarDate(clamped);
    const previousMonth = formatCalendarMonth(selectedDate);
    const month = formatCalendarMonth(clamped);
    if (!controlled) setInnerDate(clamped);
    if (nextKey !== currentKey) input.onUpdateModelValue?.(nextKey);
    const payload = { date: nextKey, month, scene };
    input.onChange?.(payload);
    input.onConfirm?.(payload);
    if (previousMonth !== month) input.onMonthChange?.({ month, scene });
  };

  const changeFull = (show: boolean, source: 'button' | 'hint' | 'pull-down' | 'pull-up' | 'auto') => {
    if (!props.fullCalendar || show === showFull) return;
    setShowFull(show);
    input.onToggleFull?.({ show, source });
  };
  const previousMonthDate = selectedDate ? clampCalendarDate(addCalendarMonths(selectedDate, -1), minDate, maxDate) : null;
  const nextMonthDate = selectedDate ? clampCalendarDate(addCalendarMonths(selectedDate, 1), minDate, maxDate) : null;
  const previousDisabled = previousMonthDate !== null && selectedDate !== null && compareCalendarDates(previousMonthDate, selectedDate) === 0;
  const nextDisabled = nextMonthDate !== null && selectedDate !== null && compareCalendarDates(nextMonthDate, selectedDate) === 0;
  const prevMonth = useCallback(() => {
    if (previousMonthDate && !previousDisabled) emitSelection(previousMonthDate, 'switch');
  }, [emitSelection, previousDisabled, previousMonthDate]);
  const nextMonth = useCallback(() => {
    if (nextMonthDate && !nextDisabled) emitSelection(nextMonthDate, 'switch');
  }, [emitSelection, nextDisabled, nextMonthDate]);
  const toggleFull = useCallback(() => {
    changeFull(!showFull, 'button');
  }, [changeFull, showFull]);
  useImperativeHandle(ref, () => ({ nextMonth, prevMonth, toggleFull }), [nextMonth, prevMonth, toggleFull]);
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dy) > 2 && Math.abs(gesture.dy) >= Math.abs(gesture.dx),
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dy >= threshold) changeFull(true, 'pull-down');
      if (gesture.dy <= -threshold) changeFull(false, 'pull-up');
    },
  }), [threshold, showFull, props.fullCalendar]);

  if (!selectedDate) return null;

  return (
    <View {...responder.panHandlers} style={[{ backgroundColor: '#ffffff', paddingVertical: 8 }, input.customStyle]} testID="up-calendar-strip">
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: previousDisabled }} disabled={previousDisabled} onPress={() => emitSelection(previousMonthDate!, 'switch')} style={{ padding: 8 }} testID="up-calendar-strip-prev"><Text style={{ color: previousDisabled ? '#c8c9cc' : props.color }}>上月</Text></Pressable>
        <Text style={{ color: '#303133', fontSize: 16, fontWeight: '600' }}>{formatCalendarMonth(selectedDate).replace('-', '年')}月</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: nextDisabled }} disabled={nextDisabled} onPress={() => emitSelection(nextMonthDate!, 'switch')} style={{ padding: 8 }} testID="up-calendar-strip-next"><Text style={{ color: nextDisabled ? '#c8c9cc' : props.color }}>下月</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }} testID="up-calendar-strip-scroll">
        {days.map((date, index) => {
          const dateKey = formatCalendarDate(date);
          const selected = dateKey === formatCalendarDate(selectedDate);
          const disabled = !isCalendarDateBetween(date, minDate, maxDate) || props.readonly;
          const isToday = formatCalendarDate(date) === formatCalendarDate(new Date());
          return (
            <Pressable
              accessibilityLabel={dateKey}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected }}
              disabled={disabled}
              key={dateKey}
              onPress={() => emitSelection(date, 'tap')}
              style={{ alignItems: 'center', backgroundColor: selected ? props.color : 'transparent', borderColor: isToday && !selected ? props.color : 'transparent', borderRadius: 5, borderWidth: isToday && !selected ? 1 : 0, marginHorizontal: index === 0 ? 12 : 4, minWidth: 44, paddingVertical: 7 }}
              testID={`up-calendar-strip-day-${dateKey.replaceAll('-', '')}`}
            >
              <Text style={{ color: selected ? '#ffffff' : disabled ? '#c8c9cc' : '#909399', fontSize: 11 }}>{props.weekText?.[(date.getDay() + 6) % 7]}</Text>
              <Text style={{ color: selected ? '#ffffff' : disabled ? '#c8c9cc' : '#303133', fontSize: 17, marginTop: 2 }}>{date.getDate()}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {props.fullCalendar ? (
        <>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showFull }} onPress={() => changeFull(!showFull, 'button')} style={{ alignItems: 'center', paddingTop: 8 }} testID="up-calendar-strip-toggle"><Text style={{ color: props.color }}>{showFull ? '收起' : '展开'}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => changeFull(!showFull, 'hint')} style={{ alignItems: 'center', paddingTop: 4 }} testID="up-calendar-strip-hint"><Text style={{ color: '#909399', fontSize: 12 }}>{showFull ? props.collapseHint : props.expandHint}</Text></Pressable>
          {showFull ? (
            <View testID="up-calendar-strip-full">
              <UPCalendar
                {...props.fullCalendarProps}
                color={props.color}
                defaultDate={formatCalendarDate(selectedDate)}
                maxDate={props.maxDate}
                minDate={props.minDate}
                mode="single"
                monthNum={numberValue(props.fullMonthNum, 24)}
                monthSwitch
                onConfirm={(dates) => {
                  const date = normalizeCalendarDate(dates[0] ?? '');
                  if (!date) return;
                  emitSelection(date, 'full');
                  if (props.collapseAfterSelect) changeFull(false, 'auto');
                }}
                pageInline
                readonly={props.readonly}
                show
                showConfirm={false}
              />
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
});
