/**
 * Smoke test for the component demo pages.
 *
 * The index is a single flat page whose groups mirror upstream
 * `pages/example/components.config.js`, so the assertions below are about
 * SOURCE_GROUPS rather than the local `category` field — `category` only locates
 * the demo file on disk now.
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { UPRoot } from 'ultra-ui-rn';
import { COMPONENTS, DemoPagesHost, SOURCE_GROUPS, TemplatePagesHost } from '../pages';

const render = async (node: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<UPRoot>{node}</UPRoot>);
  });
  return renderer;
};

const UPSTREAM_GROUPS = [
  '基础组件',
  '表单组件',
  '数据组件',
  '反馈组件',
  '布局组件',
  '导航组件',
  '其他组件',
] as const;

test('source groups reproduce the upstream index, plus one local-only group', () => {
  expect(SOURCE_GROUPS.map((g) => g.groupName).slice(0, 7)).toEqual([...UPSTREAM_GROUPS]);
  expect(SOURCE_GROUPS).toHaveLength(8);
  expect(SOURCE_GROUPS[7]?.groupName).toBe('本地扩展（源索引未收录）');

  // Upstream's own group sizes, in order. Two entries it marks 暂无 are excluded.
  expect(SOURCE_GROUPS.slice(0, 7).map((g) => g.items.length)).toEqual([11, 20, 7, 17, 15, 12, 21]);

  // Every entry either points at a registered demo or is explicitly null.
  const ids = new Set(COMPONENTS.map((c) => c.id));
  for (const group of SOURCE_GROUPS) {
    for (const item of group.items) {
      if (item.id !== null) expect(ids.has(item.id)).toBe(true);
    }
  }
});

test('every registered component is reachable from the index', () => {
  const listed = new Set(
    SOURCE_GROUPS.flatMap((g) => g.items.map((i) => i.id)).filter((id): id is string => id !== null),
  );
  const unreachable = COMPONENTS.filter((c) => !listed.has(c.id)).map((c) => c.id);
  expect(unreachable).toEqual([]);
});

test('index lists all groups flat and opening an entry shows its demo', async () => {
  const renderer = await render(<DemoPagesHost />);
  const asJson = JSON.stringify(renderer.toJSON());

  for (const name of UPSTREAM_GROUPS) expect(asJson).toContain(name);
  // Flat page: entries are visible without drilling into a category first.
  expect(asJson).toContain('Button 按钮');
  expect(asJson).toContain('Icon 图标');
  // Upstream's footer alert.
  expect(asJson).toContain('uview-plus 2022-2024');

  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ title: 'Button 按钮' }).props.onClick();
  });
  expect(JSON.stringify(renderer.toJSON())).toContain('Button');

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});

test('template tab lists the upstream template groups', async () => {
  const renderer = await render(<TemplatePagesHost />);
  const asJson = JSON.stringify(renderer.toJSON());

  expect(asJson).toContain('部件');
  expect(asJson).toContain('页面');
  expect(asJson).toContain('Coupon 优惠券');
  expect(asJson).toContain('WxCenter 仿微信个人中心');
  expect(asJson).toContain('CitySelect 城市选择');

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
