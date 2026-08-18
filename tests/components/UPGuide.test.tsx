import React, { createRef } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UP, UPGuide, UPRoot, type UPGuideRef, type UPGuideStorage } from '../../src';

const pages = [
  { desc: 'First description', title: 'First' },
  { desc: 'Second description', title: 'Second' },
];

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function storage(initial: Record<string, string> = {}): UPGuideStorage {
  const values = { ...initial };
  return {
    getItem: jest.fn(async (key) => values[key]),
    removeItem: jest.fn(async (key) => {
      delete values[key];
    }),
    setItem: jest.fn(async (key, value) => {
      values[key] = value;
    }),
  };
}

it('is hidden by default and visible when show is true', () => {
  const hidden = renderRoot(<UPGuide list={pages} />);
  expect(hidden.queryByTestId('up-guide')).toBeNull();

  const visible = renderRoot(<UPGuide list={pages} show />);
  expect(visible.getByTestId('up-guide')).toBeTruthy();
  expect(visible.getByText('First')).toBeTruthy();
});

it('next button advances pages and emits onChange', () => {
  const onChange = jest.fn();
  const screen = renderRoot(<UPGuide list={pages} onChange={onChange} show />);

  act(() => {
    fireEvent.press(screen.getByTestId('up-guide-next'));
  });

  expect(onChange).toHaveBeenCalledWith({ current: 1 });
  expect(screen.getByText('Second')).toBeTruthy();
});

it('skip remembers and closes', async () => {
  const adapter = storage();
  const onSkip = jest.fn();
  const onUpdateShow = jest.fn();
  const screen = renderRoot(
    <UPGuide list={pages} onSkip={onSkip} onUpdateShow={onUpdateShow} show storage={adapter} storageKey="guide-a" />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-guide-skip'));
  });

  expect(onSkip).toHaveBeenCalledTimes(1);
  expect(adapter.setItem).toHaveBeenCalledWith('guide-a', '1');
  expect(onUpdateShow).toHaveBeenLastCalledWith(false);
  expect(screen.queryByTestId('up-guide')).toBeNull();
});

it('finish remembers, emits callbacks, and closes', async () => {
  const adapter = storage();
  const onFinish = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPGuide list={pages} onClose={onClose} onFinish={onFinish} show storage={adapter} storageKey="guide-b" />,
  );

  act(() => {
    fireEvent.press(screen.getByTestId('up-guide-next'));
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId('up-guide-finish'));
  });

  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(adapter.setItem).toHaveBeenCalledWith('guide-b', '1');
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('remembered guides stay hidden when once storage returns one', async () => {
  const adapter = storage({ guide: '1' });
  const onUpdateShow = jest.fn();
  const screen = renderRoot(<UPGuide list={pages} onUpdateShow={onUpdateShow} show storage={adapter} storageKey="guide" />);

  await waitFor(
    () => {
      expect(screen.queryByTestId('up-guide')).toBeNull();
    },
    { timeout: 5000 },
  );
  expect(onUpdateShow).toHaveBeenCalledWith(false);
});

it('ref open, close, and reset control storage-backed visibility', async () => {
  const adapter = storage({ guide: '1' });
  const ref = createRef<UPGuideRef>();
  const screen = renderRoot(<UPGuide list={pages} ref={ref} storage={adapter} storageKey="guide" />);

  await act(async () => {
    await ref.current?.reset();
    ref.current?.open();
  });

  expect(adapter.removeItem).toHaveBeenCalledWith('guide');
  expect(screen.getByTestId('up-guide')).toBeTruthy();

  await act(async () => {
    ref.current?.close(true);
  });
  expect(adapter.setItem).toHaveBeenCalledWith('guide', '1');
});

it('uses custom renderPage and merges UP.setConfig defaults', () => {
  act(() => {
    UP.setConfig({ props: { guide: { finishText: '开始', nextText: '继续' } } });
  });
  const screen = renderRoot(
    <UPGuide
      list={pages}
      renderPage={({ current, item }) => <Text>{current}:{item.title}</Text>}
      show
    />,
  );

  expect(screen.getByText('0:First')).toBeTruthy();
  expect(screen.getByTestId('up-guide-next').props.accessibilityLabel).toBe('继续');
});
