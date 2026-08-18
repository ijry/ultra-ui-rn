/**
 * P47 — Page registry mirroring the uview-plus demo app (branch `3.x`,
 * `src/pages/`, 29 navigable pages; `template/citySelect/u-city-select.vue`
 * is a helper component of the citySelect page rather than a page itself).
 * Metadata only: components are resolved in host.tsx so this module stays
 * free of React imports (and circular deps).
 */
export type DemoPageGroup =
  | 'componentsA'
  | 'componentsB'
  | 'componentsC'
  | 'componentsD'
  | 'example'
  | 'template';

export type DemoPageId =
  | 'test'
  | 'card'
  | 'parse-jump'
  | 'tabbar2'
  | 'guide'
  | 'popover'
  | 'steps'
  | 'tooltip'
  | 'cateTab'
  | 'dragsort'
  | 'pullRefresh'
  | 'select'
  | 'ad'
  | 'mine'
  | 'template'
  | 'address-index'
  | 'address-addSite'
  | 'citySelect'
  | 'comment-index'
  | 'comment-reply'
  | 'coupon'
  | 'keyboardPay'
  | 'login-index'
  | 'login-code'
  | 'mallMenu1'
  | 'mallMenu2'
  | 'order'
  | 'submitBar'
  | 'wxCenter';

export interface DemoPageMeta {
  id: DemoPageId;
  title: string;
  group: DemoPageGroup;
  /** Source path under `src/pages/` in the uview-plus demo repo. */
  source: string;
}

export const DEMO_GROUPS: readonly { id: DemoPageGroup; label: string }[] = [
  { id: 'componentsA', label: '组件 A（基础）' },
  { id: 'componentsB', label: '组件 B' },
  { id: 'componentsC', label: '组件 C' },
  { id: 'componentsD', label: '组件 D' },
  { id: 'example', label: '示例页' },
  { id: 'template', label: '模板页' },
];

export const DEMO_PAGES: readonly DemoPageMeta[] = [
  // componentsA
  { id: 'test', title: '列表滚动（test）', group: 'componentsA', source: 'componentsA/test/test.vue' },
  // componentsB
  { id: 'card', title: '卡片 Card', group: 'componentsB', source: 'componentsB/card/card.vue' },
  { id: 'parse-jump', title: '跳转测试页', group: 'componentsB', source: 'componentsB/parse/jump.vue' },
  { id: 'tabbar2', title: '标签栏 Tabbar', group: 'componentsB', source: 'componentsB/tabbar/tabbar2.vue' },
  // componentsC
  { id: 'guide', title: '引导 Guide', group: 'componentsC', source: 'componentsC/guide/guide.vue' },
  { id: 'popover', title: '气泡 Popover', group: 'componentsC', source: 'componentsC/popover/popover.vue' },
  { id: 'steps', title: '步骤条 Steps', group: 'componentsC', source: 'componentsC/steps/steps.vue' },
  { id: 'tooltip', title: '长按提示 Tooltip', group: 'componentsC', source: 'componentsC/tooltip/tooltip.vue' },
  // componentsD
  { id: 'cateTab', title: '分类 CateTab', group: 'componentsD', source: 'componentsD/cateTab/cateTab.vue' },
  { id: 'dragsort', title: '拖拽排序 Dragsort', group: 'componentsD', source: 'componentsD/dragsort/dragsort.vue' },
  { id: 'pullRefresh', title: '下拉刷新 PullRefresh', group: 'componentsD', source: 'componentsD/pullRefresh/pullRefresh.vue' },
  { id: 'select', title: '下拉选择 Select', group: 'componentsD', source: 'componentsD/select/select.vue' },
  // example
  { id: 'ad', title: '激励视频广告', group: 'example', source: 'example/ad.vue' },
  { id: 'mine', title: '我的', group: 'example', source: 'example/mine.vue' },
  { id: 'template', title: '模板入口', group: 'example', source: 'example/template.vue' },
  // template
  { id: 'address-index', title: '收货地址', group: 'template', source: 'template/address/index.vue' },
  { id: 'address-addSite', title: '新建地址', group: 'template', source: 'template/address/addSite.vue' },
  { id: 'citySelect', title: '城市选择', group: 'template', source: 'template/citySelect/index.vue' },
  { id: 'comment-index', title: '评论列表', group: 'template', source: 'template/comment/index.vue' },
  { id: 'comment-reply', title: '评论回复', group: 'template', source: 'template/comment/reply.vue' },
  { id: 'coupon', title: '优惠券', group: 'template', source: 'template/coupon/index.vue' },
  { id: 'keyboardPay', title: '支付键盘', group: 'template', source: 'template/keyboardPay/index.vue' },
  { id: 'login-index', title: '登录', group: 'template', source: 'template/login/index.vue' },
  { id: 'login-code', title: '验证码登录', group: 'template', source: 'template/login/code.vue' },
  { id: 'mallMenu1', title: '分类菜单 1', group: 'template', source: 'template/mallMenu/index1.vue' },
  { id: 'mallMenu2', title: '分类菜单 2', group: 'template', source: 'template/mallMenu/index2.vue' },
  { id: 'order', title: '订单列表', group: 'template', source: 'template/order/index.vue' },
  { id: 'submitBar', title: '提交操作栏', group: 'template', source: 'template/submitBar/index.vue' },
  { id: 'wxCenter', title: '个人中心', group: 'template', source: 'template/wxCenter/index.vue' },
];
