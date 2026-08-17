import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPCalendarStrip, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function panEvent(previousY: number, currentY: number, timestamp: number) {
  return {
    nativeEvent: {},
    touchHistory: {
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: timestamp,
      numberActiveTouches: 1,
      touchBank: [{
        currentPageX: 0,
        currentPageY: currentY,
        currentTimeStamp: timestamp,
        previousPageX: 0,
        previousPageY: previousY,
        touchActive: true,
      }],
    },
  };
}

function releasePan(strip: { props: Record<string, (event: unknown) => void> }, y: number, timestamp: number) {
  strip.props.onResponderGrant(panEvent(0, 0, timestamp));
  strip.props.onResponderMove(panEvent(0, y, timestamp + 1));
  strip.props.onResponderRelease(panEvent(y, y, timestamp + 2));
}

describe('UPCalendarStrip', () => {
  it('emits controlled month switches in documented callback order', () => {
    const events: string[] = [];
    const screen = renderRoot(
      <UPCalendarStrip
        maxDate="2024-06-30"
        minDate="2024-05-01"
        modelValue="2024-05-10"
        onChange={(payload) => events.push(`change:${payload.date}:${payload.scene}`)}
        onConfirm={(payload) => events.push(`confirm:${payload.date}:${payload.scene}`)}
        onMonthChange={(payload) => events.push(`month:${payload.month}:${payload.scene}`)}
        onUpdateModelValue={(date) => events.push(`update:${date}`)}
      />,
    );

    fireEvent.press(screen.getByTestId('up-calendar-strip-next'));
    expect(events).toEqual([
      'update:2024-06-10',
      'change:2024-06-10:switch',
      'confirm:2024-06-10:switch',
      'month:2024-06:switch',
    ]);
  });

  it('renders one horizontal week and rejects readonly selection', () => {
    const onUpdateModelValue = jest.fn();
    const screen = renderRoot(
      <UPCalendarStrip minDate="2024-05-01" modelValue="2024-05-10" onUpdateModelValue={onUpdateModelValue} readonly />,
    );

    expect(screen.getByTestId('up-calendar-strip-scroll')).toBeTruthy();
    fireEvent.press(screen.getByTestId('up-calendar-strip-day-20240511'));
    expect(onUpdateModelValue).not.toHaveBeenCalled();
  });

  it('expands with button or hint, selects from inline calendar, and auto-collapses', () => {
    const toggles: string[] = [];
    const onChange = jest.fn();
    const screen = renderRoot(
      <UPCalendarStrip
        fullCalendar
        maxDate="2024-05-31"
        minDate="2024-05-01"
        modelValue="2024-05-10"
        onChange={onChange}
        onToggleFull={(payload) => toggles.push(`${payload.show}:${payload.source}`)}
      />,
    );

    fireEvent.press(screen.getByTestId('up-calendar-strip-toggle'));
    expect(screen.getByTestId('up-calendar-strip-full')).toBeTruthy();
    fireEvent.press(screen.getByTestId('up-calendar-day-20240512'));
    expect(onChange).toHaveBeenCalledWith({ date: '2024-05-12', month: '2024-05', scene: 'full' });
    expect(screen.queryByTestId('up-calendar-strip-full')).toBeNull();
    expect(toggles).toEqual(['true:button', 'false:auto']);

    fireEvent.press(screen.getByTestId('up-calendar-strip-hint'));
    expect(screen.getByTestId('up-calendar-strip-full')).toBeTruthy();
    expect(toggles).toContain('true:hint');
  });

  it('uses native pull thresholds to expand and collapse', () => {
    const toggles: string[] = [];
    const screen = renderRoot(
      <UPCalendarStrip
        fullCalendar
        minDate="2024-05-01"
        modelValue="2024-05-10"
        onToggleFull={(payload) => toggles.push(`${payload.show}:${payload.source}`)}
        pullDownThreshold={40}
      />,
    );
    const strip = screen.getByTestId('up-calendar-strip');

    act(() => releasePan(strip, 30, 1));
    expect(screen.queryByTestId('up-calendar-strip-full')).toBeNull();
    act(() => releasePan(strip, 45, 10));
    expect(screen.getByTestId('up-calendar-strip-full')).toBeTruthy();
    act(() => releasePan(strip, -45, 20));
    expect(screen.queryByTestId('up-calendar-strip-full')).toBeNull();
    expect(toggles).toEqual(['true:pull-down', 'false:pull-up']);
  });
});
