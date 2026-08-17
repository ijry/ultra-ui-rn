import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { UPPopup } from '../popup';
import type { UPCalendarTimePrecision } from './types';

export type UPCalendarTimeValue = {
  hour: number;
  minute: number;
  second: number;
};

export type UPCalendarTimePickerProps = {
  show: boolean;
  value: UPCalendarTimeValue;
  precision: UPCalendarTimePrecision;
  onConfirm: (value: UPCalendarTimeValue) => void;
  onChangeShow: (show: boolean) => void;
};

function padded(value: number): string {
  return String(value).padStart(2, '0');
}

function TimeColumn({
  value,
  count,
  kind,
  onSelect,
}: {
  value: number;
  count: number;
  kind: 'hour' | 'minute' | 'second';
  onSelect: (value: number) => void;
}): React.JSX.Element {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, height: 180 }} testID={`up-calendar-time-${kind}s`}>
      {Array.from({ length: count }, (_, index) => {
        const selected = index === value;
        const text = padded(index);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={text}
            onPress={() => onSelect(index)}
            style={{ alignItems: 'center', height: 36, justifyContent: 'center' }}
            testID={`up-calendar-time-${kind}-${text}`}
          >
            <Text style={{ color: '#303133', fontSize: 16, fontWeight: selected ? '700' : '400' }}>{text}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function UPCalendarTimePicker({
  show,
  value,
  precision,
  onConfirm,
  onChangeShow,
}: UPCalendarTimePickerProps): React.JSX.Element {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (show) setDraft(value);
  }, [show, value]);

  return (
    <UPPopup
      closeOnClickOverlay
      mode="center"
      onChangeShow={onChangeShow}
      round={8}
      show={show}
    >
      <View style={{ backgroundColor: '#ffffff', minWidth: 280, paddingBottom: 12 }} testID="up-calendar-time-picker">
        <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12 }}>
          <TimeColumn count={24} kind="hour" onSelect={(hour) => setDraft((current) => ({ ...current, hour }))} value={draft.hour} />
          {precision !== 'hour' ? <TimeColumn count={60} kind="minute" onSelect={(minute) => setDraft((current) => ({ ...current, minute }))} value={draft.minute} /> : null}
          {precision === 'second' ? <TimeColumn count={60} kind="second" onSelect={(second) => setDraft((current) => ({ ...current, second }))} value={draft.second} /> : null}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 14, paddingTop: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => onChangeShow(false)} style={{ padding: 8 }} testID="up-calendar-time-cancel"><Text style={{ color: '#909399', fontSize: 14 }}>取消</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => { onConfirm(draft); onChangeShow(false); }} style={{ padding: 8 }} testID="up-calendar-time-confirm"><Text style={{ color: '#3c9cff', fontSize: 14 }}>确认</Text></Pressable>
        </View>
      </View>
    </UPPopup>
  );
}
