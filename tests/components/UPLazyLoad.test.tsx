import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { UP, UPLazyLoad, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders placeholder while hidden', () => {
  const screen = renderRoot(
    <UPLazyLoad placeholder={<Text>waiting</Text>} src="https://example.com/a.jpg" visible={false} />,
  );

  expect(screen.getByText('waiting')).toBeTruthy();
  expect(screen.queryByTestId('up-image-native')).toBeNull();
});

it('renders UPImage when controlled visible is true', () => {
  const screen = renderRoot(
    <UPLazyLoad src="https://example.com/a.jpg" visible />,
  );

  expect(screen.getByTestId('up-lazy-load-content')).toBeTruthy();
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('fires onVisible only on hidden to visible transition', () => {
  const onVisible = jest.fn();
  const screen = renderRoot(
    <UPLazyLoad onVisible={onVisible} src="https://example.com/a.jpg" visible={false} />,
  );

  screen.rerender(
    <UPRoot>
      <UPLazyLoad onVisible={onVisible} src="https://example.com/a.jpg" visible />
    </UPRoot>,
  );
  screen.rerender(
    <UPRoot>
      <UPLazyLoad onVisible={onVisible} src="https://example.com/a.jpg" visible />
    </UPRoot>,
  );

  expect(onVisible).toHaveBeenCalledTimes(1);
});

it('uses measured viewport and scroll inputs with threshold', () => {
  const screen = renderRoot(
    <UPLazyLoad
      height={100}
      placeholder={<Text>waiting</Text>}
      scrollOffset={0}
      src="https://example.com/a.jpg"
      threshold={20}
      viewport={{ height: 200, width: 300 }}
      width={100}
    />,
  );

  act(() => {
    screen.getByTestId('up-lazy-load').props.onLayout({
      nativeEvent: { layout: { height: 100, width: 100, x: 0, y: 210 } },
    });
  });
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('keeps content mounted when once is true', () => {
  const screen = renderRoot(
    <UPLazyLoad once src="https://example.com/a.jpg" visible />,
  );

  expect(screen.getByTestId('up-image-native')).toBeTruthy();
  screen.rerender(
    <UPRoot>
      <UPLazyLoad once src="https://example.com/a.jpg" visible={false} />
    </UPRoot>,
  );
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('renders custom content through renderContent', () => {
  const screen = renderRoot(
    <UPLazyLoad renderContent={() => <Text>loaded custom content</Text>} visible />,
  );

  expect(screen.getByText('loaded custom content')).toBeTruthy();
});

it('merges UP.setConfig lazy-load defaults', () => {
  act(() => {
    UP.setConfig({ props: { lazyLoad: { threshold: 60, width: 120 } } });
  });

  const screen = renderRoot(
    <UPLazyLoad height={80} placeholder={<Text>waiting</Text>} src="https://example.com/a.jpg" visible={false} />,
  );

  expect(screen.getByTestId('up-lazy-load').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 80, width: 120 })]),
  );
});
