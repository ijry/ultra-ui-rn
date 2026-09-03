import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPParse, UPRoot, type UPParseRef } from '../../src';

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

it('resolves relative link URLs with domain prop', () => {
  const onLinktap = jest.fn();
  const screen = renderRoot(
    <UPParse content={'<a href="/docs/guide">Guide</a>'} domain="https://example.com" onLinktap={onLinktap} />,
  );
  const node = screen.getAllByTestId('up-parse-node-a')[0];
  fireEvent.press(node);
  expect(onLinktap).toHaveBeenCalledWith({ href: 'https://example.com/docs/guide' });
});

it('does not modify absolute URLs with domain prop', () => {
  const onLinktap = jest.fn();
  const screen = renderRoot(
    <UPParse content={'<a href="https://other.com/page">Page</a>'} domain="https://example.com" onLinktap={onLinktap} />,
  );
  const node = screen.getAllByTestId('up-parse-node-a')[0];
  fireEvent.press(node);
  expect(onLinktap).toHaveBeenCalledWith({ href: 'https://other.com/page' });
});

it('does not modify anchor links with domain prop', () => {
  const onLinktap = jest.fn();
  const screen = renderRoot(
    <UPParse content={'<a href="#section">Section</a>'} domain="https://example.com" onLinktap={onLinktap} />,
  );
  const node = screen.getAllByTestId('up-parse-node-a')[0];
  fireEvent.press(node);
  expect(onLinktap).toHaveBeenCalledWith({ href: '#section' });
});

it('resolves relative image URLs in imgtap event', () => {
  const onImgtap = jest.fn();
  const screen = renderRoot(
    <UPParse content={'<img src="/images/pic.png" alt="pic" />'} domain="https://example.com" onImgtap={onImgtap} />,
  );
  const node = screen.getAllByTestId('up-parse-node-img')[0];
  fireEvent.press(node);
  expect(onImgtap).toHaveBeenCalledWith({ src: 'https://example.com/images/pic.png', alt: 'pic' });
});

const TABLE = '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>';

it('wraps tables in a horizontal ScrollView when scrollTable is on', () => {
  const screen = renderRoot(<UPParse content={TABLE} scrollTable />);
  const scroll = screen.getByTestId('up-parse-table-scroll');
  expect(scroll).toBeTruthy();
  expect(scroll.props.horizontal).toBe(true);
});

it('leaves tables unwrapped when scrollTable is off', () => {
  const screen = renderRoot(<UPParse content={TABLE} />);
  expect(screen.queryByTestId('up-parse-table-scroll')).toBeNull();
  expect(screen.getByTestId('up-parse')).toHaveTextContent(/A/);
});

it('gives cells a fixed minWidth under scrollTable instead of flex', () => {
  const flexed = renderRoot(<UPParse content={TABLE} />);
  expect(flexed.getAllByTestId('up-parse-cell')[0].props.style).toMatchObject({ flex: 1 });

  const scrolled = renderRoot(<UPParse content={TABLE} scrollTable />);
  expect(scrolled.getAllByTestId('up-parse-cell')[0].props.style).toMatchObject({ minWidth: 100 });
});

it('wraps id-bearing nodes in an anchor container when useAnchor is on', () => {
  const screen = renderRoot(<UPParse content={'<p id="intro">Intro</p>'} useAnchor />);
  expect(screen.getByTestId('up-parse-anchor-intro')).toBeTruthy();
});

it('does not wrap anchors when useAnchor is off', () => {
  const screen = renderRoot(<UPParse content={'<p id="intro">Intro</p>'} useAnchor={false} />);
  expect(screen.queryByTestId('up-parse-anchor-intro')).toBeNull();
});

it('rejects navigateTo when useAnchor is disabled', async () => {
  const ref = React.createRef<UPParseRef>();
  renderRoot(<UPParse content={'<p id="intro">Intro</p>'} ref={ref} />);
  await expect(ref.current?.navigateTo('intro')).rejects.toThrow('Anchor is disabled');
});

it('rejects navigateTo for an unknown anchor id', async () => {
  const ref = React.createRef<UPParseRef>();
  renderRoot(<UPParse content={'<p id="intro">Intro</p>'} ref={ref} useAnchor />);
  await expect(ref.current?.navigateTo('missing')).rejects.toThrow('not found');
});

it('scrolls to the top for navigateTo with no id', async () => {
  const ref = React.createRef<UPParseRef>();
  renderRoot(<UPParse content={'<p id="intro">Intro</p>'} ref={ref} useAnchor={40} />);
  await expect(ref.current?.navigateTo()).resolves.toBeUndefined();
});
