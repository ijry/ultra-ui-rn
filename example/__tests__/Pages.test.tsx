/**
 * Smoke test for the component demo pages.
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { UPRoot } from 'ultra-ui-rn';
import { CATEGORIES, COMPONENTS, DemoPagesHost } from '../pages';

const render = async (node: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<UPRoot>{node}</UPRoot>);
  });
  return renderer;
};

test('registry has all categories and components', () => {
  expect(CATEGORIES.length).toBe(7);
  expect(COMPONENTS.length).toBeGreaterThanOrEqual(90);
  
  // Check each category has components
  for (const cat of CATEGORIES) {
    const comps = COMPONENTS.filter(c => c.category === cat.id);
    expect(comps.length).toBeGreaterThan(0);
  }
});

test('index lists every category and opening one shows component list', async () => {
  const renderer = await render(<DemoPagesHost />);
  let tree = renderer.toJSON();
  expect(tree).toBeTruthy();
  const asJson = JSON.stringify(tree);
  
  // Check all categories are listed
  for (const cat of CATEGORIES) {
    expect(asJson).toContain(cat.title);
  }

  // Open the basic category
  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ testID: 'category-basic' })
      .props.onPress();
  });
  tree = renderer.toJSON();
  expect(JSON.stringify(tree)).toContain('Button');
  expect(JSON.stringify(tree)).toContain('Icon');

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});

test('component categories render correctly', async () => {
  const renderer = await render(<DemoPagesHost />);
  
  // Check that the title renders
  const tree = renderer.toJSON();
  const asJson = JSON.stringify(tree);
  expect(asJson).toContain('组件示例');
  
  // React splits text nodes, so we check for just the number
  expect(asJson).toContain('95');
  
  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
