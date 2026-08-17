import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPParse, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders headings, paragraphs, links and images', () => {
  const screen = renderRoot(
    <UPParse content={'<h1>Hello</h1><p>World <a href="https://uviewui.com">link</a></p><img src="https://img.example.com/a.png" />'} />,
  );
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/Hello/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/World/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/link/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/图片/);
});

it('emits linktap on anchor press and click with node detail', () => {
  const onLinktap = jest.fn();
  const onClick = jest.fn();
  const screen = renderRoot(
    <UPParse content={'<a href="https://uviewui.com">go</a>'} onClick={onClick} onLinktap={onLinktap} />,
  );
  const node = screen.getAllByTestId('up-parse-node-a')[0];
  fireEvent.press(node);
  expect(onLinktap).toHaveBeenCalledWith({ href: 'https://uviewui.com' });
  expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ tag: 'a', attrs: { href: 'https://uviewui.com' } }));
});

it('emits imgtap on image press', () => {
  const onImgtap = jest.fn();
  const screen = renderRoot(
    <UPParse content={'<img src="https://img.example.com/a.png" alt="pic" />'} onImgtap={onImgtap} />,
  );
  const node = screen.getAllByTestId('up-parse-node-img')[0];
  fireEvent.press(node);
  expect(onImgtap).toHaveBeenCalledWith({ src: 'https://img.example.com/a.png', alt: 'pic' });
});

it('decodes html entities', () => {
  const screen = renderRoot(<UPParse content={'<p>a &amp; b &lt; c</p>'} />);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/a & b < c/);
});
