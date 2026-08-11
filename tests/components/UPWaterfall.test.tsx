import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot, UPWaterfall, type UPWaterfallRef } from '../../src';
import {
  calculateWaterfallColumns,
  composeWaterfallData,
  createWaterfallAddQueue,
  createWaterfallAfterAddOnePayload,
  modifyWaterfallItem,
  reconcileWaterfallItems,
  resolveWaterfallId,
} from '../../src/components/waterfall/state';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const items = [
  { id: 'a', height: 80 },
  { id: 'b', height: 140 },
  { id: 'c', height: 100 },
];

it('resolves stable ids from the configured key', () => {
  expect(resolveWaterfallId({ code: 12 }, 0, 'code')).toBe(12);
  expect(resolveWaterfallId({ name: 'missing' }, 4, 'id')).toBe('index:4');
});

it('calculates numeric and automatic column counts', () => {
  expect(calculateWaterfallColumns(640, 3, 2, 230)).toBe(3);
  expect(calculateWaterfallColumns(640, 'auto', 2, 230)).toBe(2);
  expect(calculateWaterfallColumns(1000, 'auto', 2, 230)).toBe(4);
});

it('reconciles external data by id without mutating the input', () => {
  const source = [...items];
  const next = reconcileWaterfallItems(
    [{ id: 'a', height: 60 }, { id: 'b', height: 140 }],
    source,
    'id',
  );

  expect(next.displayed).toEqual(source);
  expect(next.removedIds).toEqual([]);
  expect(source).toEqual(items);
});

it('creates a queue only for new ids', () => {
  expect(createWaterfallAddQueue(items.slice(0, 1), items, 'id')).toEqual([
    items[1],
    items[2],
  ]);
});

it('builds source-shaped after-add-one payloads', () => {
  expect(createWaterfallAfterAddOnePayload({ id: 'a', title: 'A' }, 128)).toEqual({
    id: 'a',
    title: 'A',
    height: 128,
  });
  expect(createWaterfallAfterAddOnePayload('plain', 96)).toEqual({
    item: 'plain',
    height: 96,
  });
});

it('modifies object items immutably and rejects primitive items', () => {
  const source = { id: 'a', title: 'A', meta: { color: 'red' } };
  const changed = modifyWaterfallItem(source, 'title', 'Updated');

  expect(changed).toEqual({
    id: 'a',
    title: 'Updated',
    meta: { color: 'red' },
  });
  expect(changed).not.toBe(source);
  expect(source).toEqual({ id: 'a', title: 'A', meta: { color: 'red' } });
  expect(modifyWaterfallItem('plain', 'title', 'Updated')).toBeUndefined();
  expect(modifyWaterfallItem(source, '', 'Updated')).toBeUndefined();
});

it('composes displayed and pending data into a new array', () => {
  const displayed = [{ id: 'a' }];
  const pending = [{ id: 'b' }];
  const result = composeWaterfallData(displayed, pending);

  expect(result).toEqual([{ id: 'a' }, { id: 'b' }]);
  expect(result).not.toBe(displayed);
  expect(result).not.toBe(pending);
});

const cards = [
  { id: 'a', title: 'A' },
  { id: 'b', title: 'B' },
  { id: 'c', title: 'C' },
];

it('uses modelValue as the authoritative input over value', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = renderRoot(
    <UPWaterfall
      modelValue={[cards[0]]}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={[cards[1]]}
    />,
  );

  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.queryByText('B')).toBeNull();
  expect(warn).toHaveBeenCalledWith(
    '[UPWaterfall] modelValue takes precedence over value.',
  );
  warn.mockRestore();
});

it('retains defaultValue when no controlled input is supplied', () => {
  const screen = renderRoot(
    <UPWaterfall
      defaultValue={[cards[1]]}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  expect(screen.getByText('B')).toBeTruthy();
  expect(screen.queryByText('A')).toBeNull();
});

it('warns for duplicate ids and keeps deterministic first-match removal', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const duplicate = [
    { id: 'same', title: 'First' },
    { id: 'same', title: 'Second' },
  ];
  const ref = React.createRef<UPWaterfallRef<(typeof duplicate)[number]>>();

  renderRoot(
    <UPWaterfall
      modelValue={duplicate}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  expect(warn).toHaveBeenCalledWith(
    '[UPWaterfall] Duplicate id "same" at index 1.',
  );
  act(() => {
    expect(ref.current?.remove('same')).toBe(true);
  });
  expect(ref.current?.getData()).toEqual([duplicate[1]]);
  expect(ref.current?.remove('missing')).toBe(false);
  warn.mockRestore();
});

it('emits modelValue updates before the retained RN onChange callback', () => {
  const events: string[] = [];
  const onUpdateModelValue = jest.fn((next) => events.push(`model:${next.length}`));
  const onChange = jest.fn((next) => events.push(`change:${next.length}`));
  const ref = React.createRef<UPWaterfallRef<(typeof cards)[number]>>();

  renderRoot(
    <UPWaterfall
      modelValue={cards}
      onChange={onChange}
      onUpdateModelValue={onUpdateModelValue}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  act(() => {
    expect(ref.current?.remove('b')).toBe(true);
  });

  expect(events).toEqual(['model:2', 'change:2']);
  expect(onUpdateModelValue).toHaveBeenCalledWith([cards[0], cards[2]]);
  expect(onChange).toHaveBeenCalledWith([cards[0], cards[2]]);
});

it('modifies an object through the ref without mutating the input item', () => {
  const source = [{ id: 'a', title: 'A', nested: { keep: true } }];
  const onUpdateModelValue = jest.fn();
  const ref = React.createRef<UPWaterfallRef<(typeof source)[number]>>();

  renderRoot(
    <UPWaterfall
      modelValue={source}
      onUpdateModelValue={onUpdateModelValue}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  act(() => {
    expect(ref.current?.modify('a', 'title', 'Updated')).toBe(true);
  });

  expect(source).toEqual([{ id: 'a', title: 'A', nested: { keep: true } }]);
  expect(onUpdateModelValue).toHaveBeenCalledWith([
    { id: 'a', title: 'Updated', nested: { keep: true } },
  ]);
  expect(ref.current?.modify('missing', 'title', 'No-op')).toBe(false);
});

it('passes masonry and numeric columns to FlashList', () => {
  const screen = renderRoot(
    <UPWaterfall
      columns={3}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={cards}
    />,
  );

  const list = screen.getByTestId('up-waterfall-list');
  expect(list.props.masonry).toBe(true);
  expect(list.props.numColumns).toBe(3);
  expect(screen.getByText('A')).toBeTruthy();
});

it('computes automatic columns after container layout', () => {
  const screen = renderRoot(
    <UPWaterfall
      columns="auto"
      minColumnWidth={200}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={cards}
    />,
  );

  fireEvent(screen.getByTestId('up-waterfall'), 'layout', {
    nativeEvent: { layout: { height: 400, width: 640, x: 0, y: 0 } },
  });

  expect(screen.getByTestId('up-waterfall-list').props.numColumns).toBe(3);
});

it('queues additions and emits after-add callbacks', () => {
  jest.useFakeTimers();
  const onAfterAddOne = jest.fn();
  const onAfterAddAll = jest.fn();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      onAfterAddAll={onAfterAddAll}
      onAfterAddOne={onAfterAddOne}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={[cards[0]]}
    />,
  );

  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        estimatedItemSize={144}
        onAfterAddAll={onAfterAddAll}
        onAfterAddOne={onAfterAddOne}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        modelValue={cards}
      />
    </UPRoot>,
  );

  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'b',
    title: 'B',
    height: 144,
  });
  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'c',
    title: 'C',
    height: 144,
  });
  expect(onAfterAddAll).toHaveBeenCalledWith({ newData: cards });
  expect(onAfterAddAll.mock.calls[0][0]).not.toHaveProperty('columnHeights');
  jest.useRealTimers();
});

it('emits source-shaped add payloads with estimated height fallback', () => {
  jest.useFakeTimers();
  const onAfterAddOne = jest.fn();
  const onAfterAddAll = jest.fn();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      estimatedItemSize={144}
      modelValue={[cards[0]]}
      onAfterAddAll={onAfterAddAll}
      onAfterAddOne={onAfterAddOne}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        estimatedItemSize={144}
        modelValue={cards}
        onAfterAddAll={onAfterAddAll}
        onAfterAddOne={onAfterAddOne}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </UPRoot>,
  );

  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'b',
    title: 'B',
    height: 144,
  });
  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'c',
    title: 'C',
    height: 144,
  });
  expect(onAfterAddAll).toHaveBeenCalledWith({ newData: cards });
  expect(onAfterAddAll.mock.calls[0][0]).not.toHaveProperty('columnHeights');
  jest.useRealTimers();
});

it('uses a previously measured native height when it is available', () => {
  jest.useFakeTimers();
  const item = { id: 'measured', title: 'Measured' };
  const onAfterAddOne = jest.fn();
  const ref = React.createRef<UPWaterfallRef<typeof item>>();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      modelValue={[item]}
      onAfterAddOne={onAfterAddOne}
      ref={ref}
      renderItem={({ item: row }) => <Text>{row.title}</Text>}
    />,
  );

  fireEvent(screen.getByTestId('up-waterfall-item-measured'), 'layout', {
    nativeEvent: { layout: { height: 212, width: 120, x: 0, y: 0 } },
  });
  act(() => {
    expect(ref.current?.remove('measured')).toBe(true);
  });
  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        modelValue={[]}
        onAfterAddOne={onAfterAddOne}
        ref={ref}
        renderItem={({ item: row }) => <Text>{row.title}</Text>}
      />
    </UPRoot>,
  );
  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        modelValue={[item]}
        onAfterAddOne={onAfterAddOne}
        ref={ref}
        renderItem={({ item: row }) => <Text>{row.title}</Text>}
      />
    </UPRoot>,
  );

  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'measured',
    title: 'Measured',
    height: 212,
  });
  jest.useRealTimers();
});

it('removes pending items and prevents their delayed callbacks', () => {
  jest.useFakeTimers();
  const onAfterAddOne = jest.fn();
  const onUpdateModelValue = jest.fn();
  const ref = React.createRef<UPWaterfallRef<(typeof cards)[number]>>();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      modelValue={[cards[0]]}
      onAfterAddOne={onAfterAddOne}
      onUpdateModelValue={onUpdateModelValue}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        modelValue={cards}
        onAfterAddOne={onAfterAddOne}
        onUpdateModelValue={onUpdateModelValue}
        ref={ref}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </UPRoot>,
  );

  act(() => {
    expect(ref.current?.remove('b')).toBe(true);
    jest.advanceTimersByTime(20);
  });

  expect(onUpdateModelValue).toHaveBeenLastCalledWith([cards[0], cards[2]]);
  expect(onAfterAddOne).not.toHaveBeenCalledWith({
    id: 'b',
    title: 'B',
    height: 160,
  });
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'c',
    title: 'C',
    height: 160,
  });
  jest.useRealTimers();
});

it('supports remove, clear, and scroll refs without mutating value', () => {
  const ref = React.createRef<UPWaterfallRef<(typeof cards)[number]>>();
  const onChange = jest.fn();
  const source = [...cards];
  renderRoot(
    <UPWaterfall
      onChange={onChange}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={source}
    />,
  );

  act(() => {
    expect(ref.current?.remove('b')).toBe(true);
  });
  expect(source).toEqual(cards);
  expect(onChange).toHaveBeenCalledWith([cards[0], cards[2]]);
  act(() => {
    ref.current?.clear();
  });
  expect(onChange).toHaveBeenLastCalledWith([]);
  ref.current?.scrollToIndex(0);
  ref.current?.scrollToTop();
});

it('merges waterfall defaults through UP.setConfig', () => {
  act(() => {
    UP.setConfig({ props: { waterfall: { columns: 4, height: 220 } } });
  });

  const screen = renderRoot(
    <UPWaterfall renderItem={({ item }) => <Text>{item.title}</Text>} value={cards} />,
  );
  expect(screen.getByTestId('up-waterfall').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 220 })]),
  );
  expect(screen.getByTestId('up-waterfall-list').props.numColumns).toBe(4);
});
