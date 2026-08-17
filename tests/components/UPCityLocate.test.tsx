import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPCityLocate, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses the application location adapter on mount and emits the resolved city', async () => {
  const locate = jest.fn().mockResolvedValue({ address: { city: 'Hangzhou' }, latitude: 30.2 });
  const onLocationSuccess = jest.fn();
  const screen = renderRoot(<UPCityLocate locate={locate} onLocationSuccess={onLocationSuccess} />);

  await act(async () => {});
  expect(locate).toHaveBeenCalledWith('wgs84');
  expect(screen.getByTestId('up-city-locate-status').props.children).toBe('Hangzhou');
  expect(onLocationSuccess).toHaveBeenCalledWith(expect.objectContaining({ locationCity: 'Hangzhou', latitude: 30.2 }));
});

it('renders grouped cities through the native index list and selects a city without mutating data', () => {
  const city = { name: 'Suzhou', value: 'suzhou' };
  const onSelectCity = jest.fn();
  const screen = renderRoot(
    <UPCityLocate cityList={[[{ name: 'Hangzhou' }], [city]]} indexList={['🔥', 'S']} onSelectCity={onSelectCity} />,
  );

  expect(screen.getByTestId('up-index-list')).toBeTruthy();
  expect(screen.getByTestId('up-index-rail-1')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-city-locate-city-1-0'));
  expect(onSelectCity).toHaveBeenCalledWith({ locationCity: 'Suzhou' });
  expect(city).toEqual({ name: 'Suzhou', value: 'suzhou' });
});

it('keeps source locating text without an adapter and reports a rejected adapter as a failure', async () => {
  const pending = renderRoot(<UPCityLocate />);
  expect(pending.getByTestId('up-city-locate-status').props.children).toBe('定位中....');

  const failed = renderRoot(<UPCityLocate locate={async () => Promise.reject(new Error('denied'))} />);
  await act(async () => {});
  expect(failed.getByTestId('up-city-locate-status').props.children).toBe('定位失败');
});

it('allows currentCity to supersede a stale lookup and reruns lookup from the header', async () => {
  let resolveLookup: ((result: { locationCity: string }) => void) | undefined;
  const locate = jest.fn(() => new Promise<{ locationCity: string }>((resolve) => { resolveLookup = resolve; }));
  const screen = renderRoot(<UPCityLocate currentCity="Ningbo" locate={locate} />);

  expect(screen.getByTestId('up-city-locate-status').props.children).toBe('Ningbo');
  await act(async () => { resolveLookup?.({ locationCity: 'Stale city' }); });
  expect(screen.getByTestId('up-city-locate-status').props.children).toBe('Ningbo');
  fireEvent.press(screen.getByTestId('up-city-locate-location'));
  expect(locate).toHaveBeenCalledTimes(2);
});
