import React, { createRef } from 'react';
import { act, render } from '@testing-library/react-native';
import { UPPoster, type UPPosterHandle, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const json = {
  css: { width: 300, height: 200, backgroundColor: '#f5f5f5' },
  views: [
    { type: 'text', text: 'Hello poster', css: { left: 20, top: 20, fontSize: 18, color: '#333333' } },
    { type: 'image', src: 'https://img.example.com/a.png', css: { left: 20, top: 60, width: 80, height: 80 } },
    { type: 'view', css: { left: 20, top: 150, width: 100, height: 30, backgroundColor: '#2979ff' } },
  ],
} as const;

it('renders poster views from json', () => {
  const screen = renderRoot(<UPPoster json={json} />);
  expect(screen.getByTestId('up-poster')).toBeTruthy();
  expect(screen.getByTestId('up-poster-text-0')).toHaveTextContent(/Hello poster/);
  expect(screen.getByTestId('up-poster-image-1')).toBeTruthy();
  expect(screen.getByTestId('up-poster-view-2')).toBeTruthy();
});

it('exportImage returns dimensions with a null path by default (native boundary)', async () => {
  const ref = createRef<UPPosterHandle>();
  renderRoot(<UPPoster json={json} ref={ref} />);
  let result: Awaited<ReturnType<UPPosterHandle['exportImage']>> | undefined;
  await act(async () => {
    result = await ref.current?.exportImage();
  });
  expect(result).toEqual({ path: null, width: 300, height: 200 });
});

it('delegates export to the injected adapter', async () => {
  const ref = createRef<UPPosterHandle>();
  const adapter = jest.fn().mockResolvedValue({ path: '/tmp/poster.png', width: 300, height: 200 });
  renderRoot(<UPPoster exportImageAdapter={adapter} json={json} ref={ref} />);
  await act(async () => {
    await ref.current?.exportImage();
  });
  expect(adapter).toHaveBeenCalledWith(json, { width: 300, height: 200 });
});
