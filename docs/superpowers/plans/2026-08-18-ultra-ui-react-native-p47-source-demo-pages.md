# P47 — 源示例页复刻实施计划

## Task 1：页面注册表与 host

- 建 `example/pages/registry.ts`（30 条：id/title/group/sourcePath/component 映射）。
- 建 `example/pages/host.tsx`：`DemoPagesHost` —— 分组索引（组标题 + 页面行）+ 页面栈渲染 + 返回按钮。
- 建 `example/pages/types.ts`：`DemoPageProps`（`open: (id) => void`）+ 共享演示数据。

## Task 2：componentsA–D 组（12 页，pages-components.tsx）

- test：UPList + UPListItem + UPImage 滚动列表（源为红色 500px 列表）。
- card：UPCard 基础/高级 + UPSubsection 参数切换。
- parse/jump：跳转测试页（显示被跳转页标题）。
- tabbar2：UPTabbar ×4 变体（基础/徽标/命名/自定义图标颜色）。
- guide：UPGuide 引导页 + storage 记忆 + 重置按钮。
- popover：UPPopover 左右弹出（trigger 自定义）。
- steps：UPSteps 六种形态（基础/点/错误/自定义图标/插槽/颜色/竖向）。
- tooltip：UPTooltip 七种形态。
- cateTab：UPCateTab 分类页（tabList 延时加载）。
- dragsort：UPDragsort 单列/句柄/多列/横向。
- pullRefresh：UPPullRefresh 基础/自定义动画/虚拟列表/上拉加载。
- select：UPSelect 默认/插槽/边框。

## Task 3：example 组（3 页，pages-example.tsx）

- ad：激励视频广告占位（微信边界声明）。
- mine：UPAvatar + UPCellGroup 主题偏好（UP 主题 API）+ UpRoot 通信状态。
- template：UPCellGroup/UPCell 模板入口索引（open 跳转 template 组页面）。

## Task 4：template 组（15 页，pages-template.tsx）

- address/index：收货地址列表（UPCell/UPIcon）。
- address/addSite：表单（UPInput/UPTextarea/UPSwitch/UPPicker 省市县三列）。
- citySelect/index：城市选择（自建 u-city-select 复刻 + UPPicker）。
- comment/index + reply：评论列表与回复（点赞交互）。
- coupon/index：优惠券三种样式（金额/锯齿/使用规则）。
- keyboardPay/index：UPKeyboard 数字键盘 + UPMessageInput 支付密码。
- login/index + code：登录表单（UP.test.mobile 校验）+ 验证码页（UPMessageInput + 倒计时）。
- mallMenu/index1 + index2：双栏分类菜单 + 九宫格菜单。
- order/index：UPTabs + UPSwiper 订单列表（状态分页 + 合计）。
- submitBar/index：UPCellGroup/UPBadge 购物车提交栏。
- wxCenter/index：微信个人中心（UPNavbar/UPAvatar/UPCellGroup）。

## Task 5：接线与验证

- example/App.tsx：tabbar 加 `pages` tab，选中时渲染 `DemoPagesHost`。
- `cd example && npx tsc --noEmit` 验证。
- 新增 smoke 测试（根 tests）：注册表 30 条完整性 + host 渲染/进入页面。

## Task 6：文档与提交

- P50 一致性报告 `docs/compatibility-report.md`（与 P47 一起产出）。
- gap-matrix/compatibility/README 补 P47 记录。
- 质量门：test/typecheck/lint/build/example tsc。
- 按 P47/P50 分批提交。
