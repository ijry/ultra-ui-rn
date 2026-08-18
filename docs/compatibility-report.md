# ultra-ui-rn × uview-plus 全量一致性报告

> 基线：uview-plus `3.8.86`（npm 包，组件与 $u 工具库）+ demo 仓库 `ijry/uview-plus@3.x`（示例页）。
> 生成：P40–P47/P50 阶段（2026-08）。审计脚本：`scripts/audit-source-compat.mjs`（四维 + `--dump`/`--fail`）。

## 1. 总览

| 维度 | 源 | 本地 | 覆盖 | 工具/测试 |
|---|---|---|---|---|
| 组件 | 140 | 140 | **140/140（100%）** | `audit-source-compat.mjs` props/events |
| Props | 组件 props 全量 | 同名对齐 + 双表面别名 | **零缺口** | 审计脚本 props 维度 |
| 事件 | emits 全量 | `onXxx` 转发 | **零缺口**（委托事件已标注） | 审计脚本 events 维度 + `tests/source-contract.test.ts` |
| 默认值 | `defProps` 全量 | `src/config/defaults.ts` | **零缺口** | 审计脚本 defaults 维度 |
| ref/methods | 权威 `_XxxRef`（16 组件） | `useImperativeHandle` | **零缺口** | 审计脚本 refs 维度 + `UPRefMethods.test.tsx` |
| $u 工具函数 | 32 导出 + 16 验证器 | `src/utils/*` 全量 | **全部复刻** | `UPUtils.test.ts`（17 用例） |
| 主题 | `libs/config` colors/zIndex | `src/config/*` | **一致**（borderColor #e4e7ed、default 键已对齐） | `source-contract.test.ts` |
| 导出面 | 138 组件目录 | `src/components/index.ts` | **零缺口** | `export-audit`（4 个内部模块不导出） |
| 示例页 | `src/pages/` 29 可导航页 | `example/pages/` 29 页 | **29/29** | `example/__tests__/Pages.test.tsx` |
| 示例覆盖 | — | example 单页 107 组件区块 | **107/107** | example tsc + App.test |

## 2. 组件维度（140/140）

P40 复刻最后 8 个纯 JS 组件（action-sheet-data / color-picker / coupon / goods-sku /
markdown / message-input / parse / novel-reader），P41 补齐最后 4 个原生边界组件骨架
（cropper / poster / pdf-reader / short-video，原生能力为显式注入点）。

## 3. 事件表面（P39 + P43 收口）

- 全部 emits 以 `onXxx` 转发；`v-model` 映射为 `value`/`modelValue` + `onChangeShow` 等
  update 事件；slot 映射为 `children`/`renderXxx`/`trigger`/`content`。
- P43 审计补上 6 个真实缺口：checkbox-group / radio-group 的 input 事件、dropdown-item
  close、tabbar-item change（父组件委托，已标注）、table2 `onRowDblclick` 源名别名。
- `source-contract.test.ts` 用 `--dump` fixture 锁定 props/events/defaults，防漂移。

## 4. ref/methods 面（P45）

对齐 `_XxxRef` 权威契约：count-to（reStart/paused）、form（validate/resetFields/
scrollToField）、upload（afterRead/beforeRead/beforeDelete）、calendar-strip
（prevMonth/nextMonth/toggleFull）、read-more（init）、collapse（init）、toast/notify
（show/hide）。feedback host 的全局 API 类型更名为 `UPToastApi/UPNotifyApi`，组件 ref
类型为规范名。

## 5. $u 工具函数（P52）

`UP.<fn>` 与命名导出双通道：format（timeFormat/timeFrom/priceFormat/queryParams/trim/
padZero/getDuration/type2icon）、data（deepClone/deepMerge/shallowMerge/getProperty/
setProperty/getValueByPath/guid/random/randomArray/addUnit/addStyle/error）、calc（浮点
安全四则+round）、system（os/sys/getWindowInfo/getDeviceInfo，导航经
`setUPNavigationStack` 注入）、validation（+16 验证器，含 url/date/idCard/carNo）、
color（+genLightColor）。

## 6. 示例页复刻（P47）

`example/pages/` 29 页（6 组：componentsA–D 12 页、example 3 页、template 14 页），
`DemoPagesHost` 提供分组索引 + 栈式导航。组件页逐变体复刻；模板页含地址/城市选择
（`RegionPicker` 基于 UPPicker 级联）、评论、优惠券、支付键盘、登录验证码、双栏菜单、
订单列表（UPTabs+UPSwiper 联动）、个人中心等。

## 7. 剩余边界（诚实声明，非缺口）

| 能力 | 源用法 | 本地边界 |
|---|---|---|
| 激励视频广告 | `wx.createRewardedVideoAd` | 宿主注入广告 SDK（example/ad 页占位） |
| `setFormatter` | 微信小程序兼容 workaround | 不伪造；formatter prop 直接生效 |
| `formValidate` / `$parent` | Vue 实例依赖 | 不模拟 |
| 页面导航 `page()/pages()` | 小程序页面栈 | `setUPNavigationStack` 注入 |
| cropper 导出 | 原生裁剪 | `onConfirm` 返回参数 + `path: null`，需原生模块 |
| poster 导出 | 原生合成图 | `exportImageAdapter` 注入（如 view-shot） |
| pdf 渲染 | 原生/WebView | `renderPdf` slot |
| 短视频播放 | 原生播放器 | `renderVideo` slot（react-native-video） |
| 上传/懒加载隐式全局 | `uni.uploadFile`/IntersectionObserver | Provider/全局适配器注入（P38 决策） |

## 8. 质量门（P47 结束时）

根：**499/499** 测试 + typecheck + lint + build 全绿；example：tsc + **4/4** jest 全绿。
审计脚本 `--fail` 模式可作 CI 门禁。
