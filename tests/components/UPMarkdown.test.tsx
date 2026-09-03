import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPMarkdown, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders headings, bold, inline code and lists', () => {
  const screen = renderRoot(
    <UPMarkdown content={'# Title\n\n**bold** and `code`\n\n- a\n- b\n\n```\nconst x = 1\n```'} />,
  );
  expect(screen.getByTestId('up-markdown-heading-1')).toHaveTextContent(/Title/);
  expect(screen.getByTestId('up-markdown')).toHaveTextContent(/bold/);
  expect(screen.getByTestId('up-markdown')).toHaveTextContent(/code/);
  expect(screen.getByTestId('up-markdown')).toHaveTextContent(/const x = 1/);
});

it('emits linktap with href on link press', () => {
  const onLinktap = jest.fn();
  const screen = renderRoot(<UPMarkdown content={'[uview](https://uviewui.com)'} onLinktap={onLinktap} />);
  const link = screen.getAllByTestId(/up-markdown-link-/)[0];
  fireEvent.press(link);
  expect(onLinktap).toHaveBeenCalledWith({ href: 'https://uviewui.com' });
});

it('emits ready after render', () => {
  const onReady = jest.fn();
  renderRoot(<UPMarkdown content={'# Hi'} onReady={onReady} />);
  expect(onReady).toHaveBeenCalledTimes(1);
});

it('emits imgtap with src on image press', () => {
  const onImgtap = jest.fn();
  const screen = renderRoot(<UPMarkdown content={'![alt](https://img.example.com/a.png)'} onImgtap={onImgtap} />);
  const image = screen.getAllByTestId(/up-markdown-image-/)[0];
  fireEvent.press(image);
  expect(onImgtap).toHaveBeenCalledWith({ src: 'https://img.example.com/a.png', alt: 'alt' });
});

type RenderedNode = {
  type?: string;
  children?: Array<RenderedNode | string> | null;
};

/** Walks the rendered tree for the `<Text>` node holding the code block. */
function findCodeText(node: RenderedNode | string | null): string | null {
  if (!node || typeof node === 'string') return null;
  if (node.type === 'Text' && node.children) {
    const content = node.children.join('');
    if (content.includes('first')) return content;
  }
  if (node.children) {
    for (const child of node.children) {
      const result = findCodeText(child);
      if (result) return result;
    }
  }
  return null;
}

it('renders line numbers in code blocks when showLineNumber is true', () => {
  const screen = renderRoot(<UPMarkdown content={'```\nfirst\nsecond\nthird\n```'} showLineNumber={true} />);
  const codeText = findCodeText(screen.toJSON() as RenderedNode);
  expect(codeText).toContain('1  first');
  expect(codeText).toContain('2  second');
  expect(codeText).toContain('3  third');
});

it('omits line numbers when showLineNumber is false', () => {
  const screen = renderRoot(<UPMarkdown content={'```\nfirst\nsecond\n```'} showLineNumber={false} />);
  const codeText = findCodeText(screen.toJSON() as RenderedNode);
  expect(codeText).toContain('first');
  expect(codeText).not.toContain('1  first');
});
