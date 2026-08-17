import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPNovelReader, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const chapters = [
  { id: 1, title: '第一章', content: '第一段内容。\n第二段内容。' },
  { id: 2, title: '第二章', content: '第二章节内容。' },
];

it('renders chapter title and paragraphs', () => {
  const screen = renderRoot(<UPNovelReader chapters={chapters} />);
  expect(screen.getByTestId('up-novel-reader')).toHaveTextContent(/第一章/);
  expect(screen.getByTestId('up-novel-reader')).toHaveTextContent(/第一段内容。/);
  expect(screen.getByTestId('up-novel-reader')).toHaveTextContent(/第二段内容。/);
});

it('emits chapter-request and switches chapter from catalog', () => {
  const onChapterRequest = jest.fn();
  const screen = renderRoot(<UPNovelReader chapters={chapters} onChapterRequest={onChapterRequest} />);
  fireEvent.press(screen.getByTestId('up-novel-reader-paragraph-0'));
  fireEvent.press(screen.getByTestId('up-novel-reader-catalog'));
  fireEvent.press(screen.getByTestId('up-novel-reader-catalog-item-1'));
  expect(screen.getByTestId('up-novel-reader')).toHaveTextContent(/第二章/);
});

it('toggles next chapter from footer controls', () => {
  const screen = renderRoot(<UPNovelReader chapters={chapters} />);
  fireEvent.press(screen.getByTestId('up-novel-reader-paragraph-0'));
  fireEvent.press(screen.getByTestId('up-novel-reader-next'));
  expect(screen.getByTestId('up-novel-reader')).toHaveTextContent(/第二章/);
});

it('emits bookmark-change when toggling a bookmark', () => {
  const onBookmarkChange = jest.fn();
  const screen = renderRoot(<UPNovelReader chapters={chapters} onBookmarkChange={onBookmarkChange} />);
  fireEvent.press(screen.getByTestId('up-novel-reader-paragraph-0'));
  fireEvent.press(screen.getByTestId('up-novel-reader-bookmark'));
  expect(onBookmarkChange).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ chapterIndex: 0, paragraphIndex: 0 })]),
  );
});

it('emits settings-change when font size changes', () => {
  const onSettingsChange = jest.fn();
  const screen = renderRoot(<UPNovelReader chapters={chapters} onSettingsChange={onSettingsChange} />);
  fireEvent.press(screen.getByTestId('up-novel-reader-paragraph-0'));
  fireEvent.press(screen.getByTestId('up-novel-reader-settings'));
  fireEvent.press(screen.getByTestId('up-novel-reader-font-plus'));
  expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ fontSize: 20 }));
});

it('emits back when the back control is pressed', () => {
  const onBack = jest.fn();
  const screen = renderRoot(<UPNovelReader chapters={chapters} onBack={onBack} />);
  fireEvent.press(screen.getByTestId('up-novel-reader-paragraph-0'));
  fireEvent.press(screen.getByTestId('up-novel-reader-back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});
