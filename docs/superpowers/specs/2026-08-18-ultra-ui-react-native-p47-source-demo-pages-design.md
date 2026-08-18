# P47 — 源 uni-app 示例页复刻为 RN 页面集（设计稿）

## 背景与目标

组件接口兼容已达成 140/140（P40/P41），工具面与主题对齐（P43–P46/P52/P53）。本阶段补齐 **示例页复刻**：uview-plus 官方 demo 仓库（`ijry/uview-plus` @ 分支 `3.x`）的 `src/pages/` 下有 **29 个可导航示例页**（12 个组件演示页 + 3 个示例页 + 14 个业务模板页；`template/citySelect/u-city-select.vue` 是 citySelect 页的辅助组件，非独立页面）。把它们复刻为本仓库 example 应用里一组**可导航的 RN 页面**，逐页验证本地 UP 组件在源 demo 的真实用法下行为一致。

## 复刻映射规则

| 源写法 | RN 映射 |
|---|---|
| `<up-button>` 等 `up-*` 标签 | `UPButton` 等 `UP*` 组件 |
| `v-model:show="x"` | `show={x} onUpdateShow={setX}`（组件无 onUpdateShow 时用受控值 + 事件回调） |
| `@click/@change/@finish` 等事件 | `onClick/onChange/onFinish` 等 |
| `uni.navigateTo` 页面跳转 | `open(pageId)` —— DemoPagesHost 提供的栈内导航 |
| `upThemeVar('--up-x', fallback)` | 直接使用源回退色值（或 `UP.color` 主题色） |
| `$u.test.mobile` / `$u.color` / `$u.route` | `UP.test.mobile` / `UP.color` / `UP.route`（navigation 注入） |
| `<scroll-view>` | `ScrollView`（RN 原生） |
| `<swiper>/<swiper-item>` | `UPSwiper`（本地组件，children 即页） |

## 页面注册表

`example/pages/registry.ts` 维护 29 条记录，镜像源 `pages.json` 分组：

- 组 `componentsA`：`test`（UPList 图片滚动）
- 组 `componentsB`：`card`、`parse/jump`、`tabbar2`
- 组 `componentsC`：`guide`、`popover`、`steps`、`tooltip`
- 组 `componentsD`：`cateTab`、`dragsort`、`pullRefresh`、`select`
- 组 `example`：`ad`、`mine`、`template`（模板入口）
- 组 `template`：`address/index`、`address/addSite`、`citySelect/index`、`comment/index`、`comment/reply`、`coupon/index`、`keyboardPay/index`、`login/index`、`login/code`、`mallMenu/index1`、`mallMenu/index2`、`order/index`、`submitBar/index`、`wxCenter/index`（14 页）

## 实现结构

```
example/pages/
  registry.ts          页面清单（id/标题/分组/源路径/组件）
  types.ts             共享类型与演示数据（站点/评论/优惠券/省市县数据）
  host.tsx             DemoPagesHost：分组索引列表 + 页面栈 + 返回
  pages-components.tsx componentsA–D 组 12 页
  pages-example.tsx    example 组 3 页
  pages-template.tsx   template 组 15 页
  index.ts             导出 DemoPagesHost
```

- `DemoPagesHost` 内部自持页面栈：`{ list } | { page, back }`，组件内页面跳转经 `open(pageId)` 入栈。
- 页面统一挂在外层 `ScrollView`（`pages-components` 内的固定高度滚动区除外，如 pullRefresh）。
- example/App.tsx 的 tabbar 增加 `pages` tab，选中时整页渲染 `DemoPagesHost`。

## 边界声明

- `ad` 页的激励视频广告（`wx.createRewardedVideoAd`）为微信能力，RN 中以按钮 + 说明占位，点击提示注入点。
- `citySelect` 的 `u-city-select` 是模板内组件（非库组件），复刻为独立页面组件，复用与 UPPicker 相同的省市县数据。
- `mallMenu/index1` 的「左侧分类 + 右侧商品」用 RN 原生双 ScrollView 实现。
- `order` 页的 swiper 分页用 UPSwiper + UPTabs 联动。
- 模板页文案/数据沿用源 demo（本地常量），图片用源 CDN 地址或 picsum 占位。

## 验收

- 29 页全部可导航、可返回，example tsc 通过。
- 每个页面使用对应 UP 组件且事件接线完整。
- 新增 smoke 测试：DemoPagesHost 渲染 29 条注册项、点击进入页面。
