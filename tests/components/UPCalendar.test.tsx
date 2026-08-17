import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { UP, UPCalendar, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const bounds = {
  maxDate: '2024-05-31',
  minDate: '2024-05-01',
} as const;

describe('UPCalendar', () => {
  it('renders configured defaults while explicit props keep precedence', () => {
    const screen = renderRoot(<UPCalendar {...bounds} pageInline show />);

    expect(screen.getByText('日期选择')).toBeTruthy();
    act(() => {
      UP.setConfig({ props: { calendar: { title: '配置标题' } } });
    });
    expect(screen.getByText('配置标题')).toBeTruthy();

    screen.rerender(<UPRoot><UPCalendar {...bounds} pageInline show title="显式标题" /></UPRoot>);
    expect(screen.getByText('显式标题')).toBeTruthy();
  });

  it('selects a single date and confirms its normalized source value', () => {
    const onConfirm = jest.fn();
    const screen = renderRoot(<UPCalendar {...bounds} onConfirm={onConfirm} pageInline show />);

    fireEvent.press(screen.getByTestId('up-calendar-day-20240502'));
    fireEvent.press(screen.getByTestId('up-calendar-confirm'));

    expect(onConfirm).toHaveBeenCalledWith(['2024-05-02']);
  });

  it('toggles multiple dates in insertion order and observes maxCount', () => {
    const onConfirm = jest.fn();
    const screen = renderRoot(
      <UPCalendar {...bounds} maxCount={2} mode="multiple" onConfirm={onConfirm} pageInline show />,
    );

    fireEvent.press(screen.getByTestId('up-calendar-day-20240503'));
    fireEvent.press(screen.getByTestId('up-calendar-day-20240501'));
    fireEvent.press(screen.getByTestId('up-calendar-day-20240504'));
    fireEvent.press(screen.getByTestId('up-calendar-confirm'));

    expect(onConfirm).toHaveBeenCalledWith(['2024-05-03', '2024-05-01']);
  });

  it('returns range boundaries or every inclusive date by rangeResultMode', () => {
    const allConfirm = jest.fn();
    const all = renderRoot(<UPCalendar {...bounds} mode="range" onConfirm={allConfirm} pageInline show />);

    fireEvent.press(all.getByTestId('up-calendar-day-20240502'));
    fireEvent.press(all.getByTestId('up-calendar-day-20240504'));
    fireEvent.press(all.getByTestId('up-calendar-confirm'));
    expect(allConfirm).toHaveBeenCalledWith(['2024-05-02', '2024-05-03', '2024-05-04']);

    const boundaryConfirm = jest.fn();
    const boundary = renderRoot(
      <UPCalendar {...bounds} mode="range" onConfirm={boundaryConfirm} pageInline rangeResultMode="boundary" show />,
    );
    fireEvent.press(boundary.getByTestId('up-calendar-day-20240502'));
    fireEvent.press(boundary.getByTestId('up-calendar-day-20240504'));
    fireEvent.press(boundary.getByTestId('up-calendar-confirm'));
    expect(boundaryConfirm).toHaveBeenCalledWith(['2024-05-02', '2024-05-04']);
  });

  it('enforces readonly, min/max, forbidden dates, and same-day range rules', () => {
    const onConfirm = jest.fn();
    const readonly = renderRoot(<UPCalendar {...bounds} onConfirm={onConfirm} pageInline readonly show />);
    fireEvent.press(readonly.getByTestId('up-calendar-day-20240502'));
    fireEvent.press(readonly.getByTestId('up-calendar-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();

    const range = renderRoot(<UPCalendar {...bounds} mode="range" onConfirm={onConfirm} pageInline show />);
    fireEvent.press(range.getByTestId('up-calendar-day-20240502'));
    fireEvent.press(range.getByTestId('up-calendar-day-20240502'));
    expect(range.getByTestId('up-calendar-confirm').props.accessibilityState.disabled).toBe(true);
  });

  it('merges custom day data after lunar values and before formatter output', () => {
    const screen = renderRoot(
      <UPCalendar
        {...bounds}
        customList={[{ bottomInfo: '自定义', date: '2024-05-02', dot: true }]}
        formatter={(day) => (day.day === 3 ? { ...day, bottomInfo: '格式化' } : day)}
        pageInline
        show
        showLunar
      />,
    );

    expect(screen.getByText('自定义')).toBeTruthy();
    expect(screen.getAllByText('格式化')).not.toHaveLength(0);
    expect(screen.getByTestId('up-calendar-dot-20240502')).toBeTruthy();
  });

  it('uses popup closing callbacks in source order and keeps inline content in layout', () => {
    const events: string[] = [];
    const popup = renderRoot(
      <UPCalendar
        {...bounds}
        closeOnClickOverlay
        onChangeShow={(show) => events.push(`show:${show}`)}
        onClose={() => events.push('close')}
        show
      />,
    );

    expect(popup.getByTestId('up-popup')).toBeTruthy();
    fireEvent.press(popup.getByTestId('up-popup-overlay'));
    expect(events).toEqual(['show:false', 'close']);

    const inline = renderRoot(<UPCalendar {...bounds} pageInline show />);
    expect(inline.getByTestId('up-calendar-content')).toBeTruthy();
    expect(inline.queryByTestId('up-popup')).toBeNull();
  });

  it('navigates clamped months, jumps to today, and auto-confirms valid selections', () => {
    const onConfirm = jest.fn();
    const screen = renderRoot(
      <UPCalendar
        defaultDate="2024-05-10"
        maxDate="2024-06-30"
        minDate="2024-05-01"
        monthSwitch
        onConfirm={onConfirm}
        pageInline
        show
        showConfirm={false}
      />,
    );

    expect(screen.getByText('2024年05月')).toBeTruthy();
    expect(screen.getByTestId('up-calendar-prev').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByTestId('up-calendar-next'));
    expect(screen.getByText('2024年06月')).toBeTruthy();
    expect(screen.getByTestId('up-calendar-next').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByTestId('up-calendar-day-20240605'));
    expect(onConfirm).toHaveBeenCalledWith(['2024-06-05']);
  });

  it('disables incomplete ranges and lets a supplied footer replace confirmation controls', () => {
    const screen = renderRoot(
      <UPCalendar {...bounds} mode="range" pageInline show />,
    );
    expect(screen.getByTestId('up-calendar-confirm').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByTestId('up-calendar-day-20240505'));
    expect(screen.getByTestId('up-calendar-confirm').props.accessibilityState.disabled).toBe(true);

    const footer = renderRoot(
      <UPCalendar {...bounds} footer={<Text>自定义底部</Text>} pageInline show />,
    );
    expect(footer.getByText('自定义底部')).toBeTruthy();
    expect(footer.queryByTestId('up-calendar-confirm')).toBeNull();
  });

  it('formats time values at the requested precision through native columns', () => {
    const onConfirm = jest.fn();
    const screen = renderRoot(
      <UPCalendar {...bounds} enableTime onConfirm={onConfirm} pageInline show timePrecision="second" />,
    );

    fireEvent.press(screen.getByTestId('up-calendar-day-20240503'));
    fireEvent.press(screen.getByTestId('up-calendar-time-single'));
    fireEvent.press(screen.getByTestId('up-calendar-time-hour-09'));
    fireEvent.press(screen.getByTestId('up-calendar-time-minute-05'));
    fireEvent.press(screen.getByTestId('up-calendar-time-second-07'));
    fireEvent.press(screen.getByTestId('up-calendar-time-confirm'));
    fireEvent.press(screen.getByTestId('up-calendar-confirm'));

    expect(onConfirm).toHaveBeenCalledWith(['2024-05-03 09:05:07']);
  });

  it('blocks a same-day boundary range whose end time precedes its start', () => {
    const onConfirm = jest.fn();
    const screen = renderRoot(
      <UPCalendar
        {...bounds}
        allowSameDay
        enableTime
        mode="range"
        onConfirm={onConfirm}
        pageInline
        rangeResultMode="boundary"
        show
      />,
    );

    fireEvent.press(screen.getByTestId('up-calendar-day-20240503'));
    fireEvent.press(screen.getByTestId('up-calendar-day-20240503'));
    fireEvent.press(screen.getByTestId('up-calendar-time-start'));
    fireEvent.press(screen.getByTestId('up-calendar-time-hour-14'));
    fireEvent.press(screen.getByTestId('up-calendar-time-confirm'));
    fireEvent.press(screen.getByTestId('up-calendar-time-end'));
    fireEvent.press(screen.getByTestId('up-calendar-time-hour-13'));
    fireEvent.press(screen.getByTestId('up-calendar-time-minute-59'));
    fireEvent.press(screen.getByTestId('up-calendar-time-confirm'));

    expect(screen.getByTestId('up-calendar-confirm').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByTestId('up-calendar-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
