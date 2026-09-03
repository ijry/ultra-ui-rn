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
  // Images now render as actual Image components with loading states
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/加载中/);
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

it('renders additional HTML tags: sup, sub, s, small, big, ruby, section', () => {
  const screen = renderRoot(
    <UPParse content={'<p>x<sup>2</sup> H<sub>2</sub>O <s>old</s> <small>fine</small> <big>loud</big></p><section><ruby>漢<rt>kan</rt></ruby></section>'} />,
  );
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/x/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/2/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/H/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/O/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/old/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/fine/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/loud/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/漢/);
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/kan/);
});

it('resolves relative image URLs with domain prop', () => {
  const screen = renderRoot(
    <UPParse content={'<img src="/path/to/image.png" />'} domain="https://example.com" />,
  );
  // Image should be in loading state initially
  const imgNode = screen.getByTestId('up-parse-node-img');
  expect(imgNode).toBeTruthy();
});

it('displays error state when image fails to load', () => {
  const screen = renderRoot(
    <UPParse content={'<img src="" alt="broken" />'} />,
  );
  // Empty src should trigger error state
  expect(screen.getByText(/图片加载失败/)).toBeTruthy();
});
