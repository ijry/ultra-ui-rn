import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { View } from 'react-native';
import { UPRoot, UPShortVideo } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const videos = [
  { id: 1, title: 'V1', url: 'https://example.com/1.mp4' },
  { id: 2, title: 'V2', url: 'https://example.com/2.mp4' },
];

it('emits tabChange on tab press', () => {
  const onTabChange = jest.fn();
  const screen = renderRoot(
    <UPShortVideo onTabChange={onTabChange} tabsList={[{ name: '推荐' }, { name: '关注' }]} videoList={videos} />,
  );
  fireEvent.press(screen.getByTestId('up-short-video-tab-1'));
  expect(onTabChange).toHaveBeenCalledWith(1);
});

it('emits like/comment/share/collect with item and index', () => {
  const onLike = jest.fn();
  const onComment = jest.fn();
  const onShare = jest.fn();
  const onCollect = jest.fn();
  const screen = renderRoot(
    <UPShortVideo
      onCollect={onCollect}
      onComment={onComment}
      onLike={onLike}
      onShare={onShare}
      videoList={videos}
    />,
  );
  fireEvent.press(screen.getByTestId('up-short-video-like-0'));
  fireEvent.press(screen.getByTestId('up-short-video-comment-0'));
  fireEvent.press(screen.getByTestId('up-short-video-share-0'));
  fireEvent.press(screen.getByTestId('up-short-video-collect-0'));
  expect(onLike).toHaveBeenCalledWith({ item: videos[0], index: 0 });
  expect(onComment).toHaveBeenCalledWith({ item: videos[0], index: 0 });
  expect(onShare).toHaveBeenCalledWith({ item: videos[0], index: 0 });
  expect(onCollect).toHaveBeenCalledWith({ item: videos[0], index: 0 });
});

it('emits videoPlay and videoPause on player toggle', () => {
  const onVideoPlay = jest.fn();
  const onVideoPause = jest.fn();
  const screen = renderRoot(
    <UPShortVideo onVideoPause={onVideoPause} onVideoPlay={onVideoPlay} videoList={videos} />,
  );
  fireEvent.press(screen.getByTestId('up-short-video-player-0'));
  expect(onVideoPlay).toHaveBeenCalledWith({ index: 0 });
  fireEvent.press(screen.getByTestId('up-short-video-player-0'));
  expect(onVideoPause).toHaveBeenCalledWith({ index: 0 });
});

it('uses the injected renderVideo slot', () => {
  const screen = renderRoot(
    <UPShortVideo
      renderVideo={(item, index) => <View testID={`custom-video-${index}`}>{String(item.title)}</View>}
      videoList={videos}
    />,
  );
  expect(screen.getByTestId('custom-video-0')).toHaveTextContent(/V1/);
});

it('emits progressChange on progress button', () => {
  const onProgressChange = jest.fn();
  const screen = renderRoot(
    <UPShortVideo onProgressChange={onProgressChange} videoList={videos} />,
  );
  fireEvent.press(screen.getByTestId('up-short-video-progress'));
  expect(onProgressChange).toHaveBeenCalledWith({ progress: 0.1, index: 0 });
});
