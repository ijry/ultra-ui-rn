import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  UPBackTop,
  UPNoticeBar,
  UPReadMore,
  UPSafeBottom,
  UPScrollHost,
  UPStatusBar,
  UPSticky,
  UPRoot,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders source safe-area surfaces and reports an explicit status-bar height', () => {
  const onUpdateHeight = jest.fn();
  const screen = renderRoot(
    <>
      <UPStatusBar bgColor="#111111" height={24} onUpdateHeight={onUpdateHeight} />
      <UPSafeBottom />
    </>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-status-bar').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#111111', height: 24 }),
  );
  expect(onUpdateHeight).toHaveBeenCalledWith(24);
  expect(screen.getByTestId('up-safe-bottom')).toBeTruthy();
});

it('closes source notice bars and reports the active source item index', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPNoticeBar
      direction="column"
      mode="closable"
      onClick={onClick}
      onClose={onClose}
      text={['First notice', 'Second notice']}
    />,
  );

  fireEvent.press(screen.getByTestId('up-notice-bar'));
  expect(onClick).toHaveBeenCalledWith(0);
  fireEvent.press(screen.getByTestId('up-notice-bar-close'));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('up-notice-bar')).toBeNull();
});

it('measures source read-more content and emits open or close names', () => {
  const onOpen = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPReadMore name="article" onClose={onClose} onOpen={onOpen} showHeight={100} toggle>
      <Text>Long source-compatible content</Text>
    </UPReadMore>,
  );

  fireEvent(screen.getByTestId('up-read-more-content'), 'layout', {
    nativeEvent: { layout: { height: 500, width: 320, x: 0, y: 0 } },
  });
  fireEvent.press(screen.getByText('展开阅读全文'));
  expect(onOpen).toHaveBeenCalledWith('article');
  fireEvent.press(screen.getByText('收起'));
  expect(onClose).toHaveBeenCalledWith('article');
});

it('uses the explicit scroll host for sticky state and back-top visibility', () => {
  const onFixed = jest.fn();
  const onUnfixed = jest.fn();
  const onBackTopClick = jest.fn();
  const screen = renderRoot(
    <UPScrollHost overlay={<UPBackTop onClick={onBackTopClick} top={50} />}>
      <UPSticky offsetTop={10} onFixed={onFixed} onUnfixed={onUnfixed}>
        <View><Text>Sticky content</Text></View>
      </UPSticky>
    </UPScrollHost>,
  );

  fireEvent(screen.getByTestId('up-sticky'), 'layout', {
    nativeEvent: { layout: { height: 40, width: 320, x: 0, y: 100 } },
  });
  fireEvent.scroll(screen.getByTestId('up-scroll-host'), {
    nativeEvent: { contentOffset: { x: 0, y: 120 } },
  });
  expect(StyleSheet.flatten(screen.getByTestId('up-sticky-fixed').props.style)).toEqual(
    expect.objectContaining({ top: 10 }),
  );
  expect(onFixed).toHaveBeenCalledWith('');
  fireEvent.press(screen.getByTestId('up-back-top'));
  expect(onBackTopClick).toHaveBeenCalledTimes(1);
  fireEvent.scroll(screen.getByTestId('up-scroll-host'), {
    nativeEvent: { contentOffset: { x: 0, y: 0 } },
  });
  expect(onUnfixed).toHaveBeenCalledWith('');
});
