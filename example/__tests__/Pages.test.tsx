/**
 * P47 — Smoke test for the source-demo page set: every registered page is
 * listed, opening a page renders it, and the back button returns to the index.
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { UPRoot } from 'ultra-ui-rn';
import { DEMO_GROUPS, DEMO_PAGES, DemoPagesHost } from '../pages';

const render = async (node: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<UPRoot>{node}</UPRoot>);
  });
  return renderer;
};

test('registry mirrors the 29 navigable source demo pages across 6 groups', () => {
  expect(DEMO_PAGES.length).toBe(29);
  expect(DEMO_GROUPS.length).toBe(6);
  const byGroup = new Map<string, number>();
  for (const page of DEMO_PAGES) {
    byGroup.set(page.group, (byGroup.get(page.group) ?? 0) + 1);
  }
  expect(byGroup.get('componentsA')).toBe(1);
  expect(byGroup.get('componentsB')).toBe(3);
  expect(byGroup.get('componentsC')).toBe(4);
  expect(byGroup.get('componentsD')).toBe(4);
  expect(byGroup.get('example')).toBe(3);
  expect(byGroup.get('template')).toBe(14);
  expect(new Set(DEMO_PAGES.map((page) => page.id)).size).toBe(29);
});

test('index lists every page and opening one shows the page view', async () => {
  const renderer = await render(<DemoPagesHost />);
  let tree = renderer.toJSON();
  expect(tree).toBeTruthy();
  const asJson = JSON.stringify(tree);
  for (const page of DEMO_PAGES) {
    expect(asJson).toContain(`demo-page-${page.id}`);
  }

  // Open the steps page.
  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ testID: 'demo-page-steps' })
      .props.onPress();
  });
  tree = renderer.toJSON();
  expect(JSON.stringify(tree)).toContain('up-steps');

  // Back to the index.
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'demo-pages-back' }).props.onPress();
  });
  tree = renderer.toJSON();
  expect(JSON.stringify(tree)).toContain('demo-page-steps');
  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});

test('template pages navigate between each other', async () => {
  const renderer = await render(<DemoPagesHost />);
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'demo-page-address-index' }).props.onPress();
  });
  // Address index offers the "新建收货地址" flow via open().
  expect(JSON.stringify(renderer.toJSON())).toContain('新建收货地址');
  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
