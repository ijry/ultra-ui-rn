# P40 — 复刻剩余纯 JS 组件（action-sheet-data / color-picker / coupon / goods-sku / markdown / message-input / parse / novel-reader）

日期：2026-08-17
阶段：P40（组件接口兼容收官 · 独立组件补齐）
基线：uview-plus@3.8.86（`src/uni_modules/uview-plus/components/`）

## 背景与目标

P0–P39 已复刻 107 个本地组件目录，props/events 双面审计已对齐。经全量比对，源 140 个组件中仍有 8 个**独立纯 JS 组件**从未复刻（gap-matrix/compatibility 均无记录）：

`u-action-sheet-data`、`u-color-picker`、`u-coupon`、`u-goods-sku`、`u-markdown`、`u-message-input`、`u-parse`、`u-novel-reader`

（另外 cropper/poster/pdf-reader/short-video 依赖 canvas/video/原生能力，属 RN 边界，列为 P41。）

目标：以源接口为准（组件名、camelCase props、默认值、事件与行为），按仓库既有「双表面兼容」惯例复刻为 RN 组件 `UPXxx`；v-model 映射为 `value/onChange` 双向 + `onInput` 源别名，slot 映射为 children/`render*` 函数，emits 映射为类型化 closure（`onXxx`，源 emit 名原样保留）。零新增第三方 JS 依赖。

## 组件接口契约（源审计结果）

### 1. UPActionSheetData（源 u-action-sheet-data，108 行）

数据驱动的选择器：触发器（默认禁用输入框展示当前 label，或 `trigger` slot）→ 点击弹出 UPActionSheet。

| prop | type | default |
|---|---|---|
| modelValue | String/Number | `''` |
| title | String | `''` |
| description | String | `''` |
| options | Array | `[]` |
| valueKey | String | `'value'` |
| labelKey | String | `'name'` |

事件：`update:modelValue` → `onChange(value)`（源别名 `onInput` 同刻触发）。

RN 映射：复用本地 `UPActionSheet`；v-model → `value` + `onChange`。

### 2. UPColorPicker（源 u-color-picker，1096 行）

HSV 颜色选择器：色相条 + 饱和度/明度面板 + 透明度条 + 常用色板 + 渐变模式（源内部含 gradient 状态机）。

| prop | type | default |
|---|---|---|
| modelValue | String | `'#ff0000'` |
| commonColors | Array | `[]`（源默认空数组） |

事件：`update:modelValue`、`confirm(color)`、`close`。

RN 映射：HSV→HEX 纯计算可完整实现；渐变方向选择器保留接口、实现基础版本（两色线性渐变）；面板交互用 PanResponder（不引入手势库新依赖，gesture-handler 已在依赖中但保持可选项——本组件用 RN 内置 PanResponder 实现拖动，避免对 gesture-handler 的强依赖）。

### 3. UPCoupon（源 u-coupon，404 行）

优惠券卡片：金额/单位/限制/标题/描述/有效期/操作按钮，`coupon`（锯齿）与 `circle`（圆孔）两种裁剪形态。

| prop | type | default |
|---|---|---|
| amount | String/Number | `''` |
| unit | String | `'￥'` |
| unitPosition | String | `'left'` |
| limit | String | `''` |
| title | String | `'优惠券'` |
| desc | String | `''` |
| time | String | `''` |
| actionText | String | `'使用'` |
| shape | String | `'coupon'` |
| size | String | `'medium'` |
| circle | Boolean | `false` |
| disabled | Boolean | `false` |
| bgColor | String | `''` |
| color | String | `''` |
| type | String | `''` |

事件：`click`（`onClick`）。

RN 映射：锯齿/圆孔用两侧绝对定位圆（白底镂空）实现——RN 无法真正裁出锯齿边缘，用「背景色圆点叠加」模拟视觉缺口（文档化 divergence）。

### 4. UPGoodsSku（源 u-goods-sku，435 行）

商品 SKU 选择弹层：规格矩阵（skuTree）+ 可选性计算（skuList）+ 数量 + 确认。

| prop | type | default |
|---|---|---|
| goodsInfo | Object | `{}` |
| skuTree | Array | `[]` |
| skuList | Array | `[]` |
| maxBuy | Number | `999` |
| confirmText | String | `'确定'` |
| closeable | Boolean | `true` |
| pageInline | Boolean | `false` |

事件：`open`、`close`、`confirm({ sku, quantity, ... })`。

RN 映射：弹层用本地 UPPopup；可选性计算（当前已选组合下哪些规格项可点）为纯 JS 逻辑，完整复刻。

### 5. UPMarkdown（源 u-markdown，342 行 + marked）

Markdown 渲染，源依赖 marked.esm.mjs。事件 `load/ready/imgtap/linktap/play/error`。

| prop | type | default |
|---|---|---|
| content | String | `''` |
| previewImg | Boolean | `true` |
| copyLink | Boolean/String | `true` |
| domain | String | `''` |
| showLineNumber | Boolean | `false` |
| theme | String | `'light'` |

RN 映射：**内置轻量 Markdown 解析器**（标题/粗体/斜体/行内代码/代码块/引用/列表/链接/图片/表格子集），渲染为嵌套 Text/View；链接点击 → `onLinktap`；图片点击 → `onImgtap`（预览走 `previewImage` 边界——RN 无 uni.previewImage，缺省 no-op + 文档化）。`load`/`ready` 在解析完成时触发。零新增依赖。

### 6. UPMessageInput（源 u-message-input，318 行）

短信验证码输入：隐藏输入框 + 格子展示（box/bottomLine/middleLine 三种模式），输入满 maxlength 触发 finish。

| prop | type | default |
|---|---|---|
| maxlength | Number/String | `4` |
| dotFill | Boolean | `false` |
| mode | String | `'box'` |
| modelValue | String/Number | `''` |
| breathe | Boolean | `true` |
| focus | Boolean | `false` |
| bold | Boolean | `false` |
| fontSize | String/Number | `60` |
| activeColor | String | `'#2979ff'` |
| inactiveColor | String | `'#606266'` |
| width | String | `'80'` |
| disabledKeyboard | Boolean | `false` |

事件：`change(value)`、`finish(value)` + `update:modelValue`。

RN 映射：隐藏 TextInput + 格子 View；数字输入限定；`change` 每次输入触发，`finish` 达 maxlength 触发。

### 7. UPParse（源 u-parse，534 vue + parse.js + parser.js）

富文本 HTML 解析渲染（源移植自 mp-html 简化版）。

| prop | type | default |
|---|---|---|
| containerStyle | String | `null` |
| content | String | — |
| copyLink | Boolean | 源默认（true） |
| domain | String | — |
| errorImg | String | 源默认 |
| lazyLoad | Boolean | 源默认（false） |
| loadingImg | String | 源默认 |
| pauseVideo | Boolean | 源默认 |
| previewImg | Boolean | 源默认（true） |
| scrollTable | Boolean | `false` |
| selectable | Boolean | `false` |
| setTitle | Boolean | 源默认 |
| showImgMenu | Boolean | 源默认 |
| tagStyle | Object | `{}` |
| useAnchor | Boolean | `null` |

事件：`click/tap/error/imgtap/linktap/load/play/ready`。

RN 映射：移植源 `parser.js` 的 HTML→节点树解析（纯 JS，MIT 来源），渲染为嵌套 Text/View（h1-h6/p/a/img/ul/ol/li/table/br/strong/em 等子集）；`click`（节点点击带 detail）、`linktap`/`imgtap` 完整转发。video/audio 节点 → 边界声明（RN 用 WebView 或 no-op）。

### 8. UPNovelReader（源 u-novel-reader，2738 行 + 5 JS 模块）

小说阅读器：章节目录 + 分页/滚动阅读 + 进度 + 书签 + 设置（主题/字号）+ 工具栏 + 自动隐藏控制条。

| prop | type | default |
|---|---|---|
| chapters | Array | `[]` |
| currentChapter | Object | `null` |
| loading | Boolean | `false` |
| error | Object | `null` |
| bookId | String/Number | `''` |
| storageKey | String | `''` |
| persist | Boolean | `true` |
| initialProgress | Object | `null` |
| progress | Object | `null` |
| initialBookmarks | Array | `[]` |
| bookmarks | Array | `null` |
| defaultSettings | Object | `{ theme:'day', fontSize:18, lineHeight:1.8, paragraphSpacing:16, contentWidth:'92%', fontFamily:'system', fontWeight:400, animation:true }` |
| settings | Object | `null` |
| mode | String | `'scroll'` |
| showBack | Boolean | `true` |
| autoBack | Boolean | `false` |
| backIcon | String | `'arrow-left'` |
| safeAreaInsetTop | Boolean | `true` |
| safeAreaInsetBottom | Boolean | `true` |
| preloadThreshold | Number | `2` |
| pageAnimation | Boolean | `true` |
| controlsAutoHide | Number | `0` |

主组件事件：`chapter-request`、`chapter-prefetch`、`progress-change`、`settings-change`、`bookmark-change`、`reading-time-change`、`back`、`mode-change`、`toolbar-change`、`layout-ready`、`retry`。
子面事件（目录/内容/设置/工具栏，同刻转发）：`page-change`、`next`、`previous`、`toggle-*`、`update-settings` 等按源保留为 `onXxx`。

RN 映射：**核心完整复刻，外围简化**——
- 阅读模式：`scroll`（FlatList）与 `page`（分页切片，onLayout 计算每页字符数）
- 内容模型：chapters → paragraphs 归一化（源 content-normalizer 逻辑简化版）
- 设置：主题（day/night/sepia/自定义 themeTokens）+ 字号/行高/段距/字重
- 书签：位置书签（章节+段落+偏移），persist 用 AsyncStorage——**边界**：RN 需外部注入 storage（`UP.setConfig({ storage })`），缺省内存态
- 工具栏/目录：内置轻量实现，事件转发
- 分页测量：RN onTextLayout 逐段测量，页面无动画简化（pageAnimation 保留接口）

## 通用映射规则（沿 P35–P39）

1. 组件名：`UP` + PascalCase（`UPActionSheetData`/`UPColorPicker`/`UPCoupon`/`UPGoodsSku`/`UPMarkdown`/`UPMessageInput`/`UPParse`/`UPNovelReader`）
2. props：camelCase 源名原样保留（`maxlength`→`maxlength`、`modelValue`→`value`+`modelValue` 别名）
3. v-model → `value` + `onChange`，源别名 `modelValue`/`onInput` 同步可用
4. emits → `onXxx` 类型化 closure，源 emit 名原样（`onFinish`/`onConfirm`/`onLinktap`…）
5. slot → children / 具名 `render*` 函数（action-sheet-data 的 `trigger` → `renderTrigger`）
6. 默认值以源为准，除文档化 divergence（如 P32 既有 RN 默认约定）

## 测试计划

- 每组件 ≥1 个测试文件：props 默认值、核心交互（选择/输入/点击）、事件 payload
- UPActionSheetData：options 选择后 onChange(value)
- UPColorPicker：confirm 返回 hex、commonColors 点击
- UPCoupon：click、disabled 拦截、渲染金额/单位
- UPGoodsSku：规格可选性计算（不可用项禁用）、confirm payload、closeable
- UPMarkdown：解析渲染（标题/粗体/代码块）、linktap payload、ready 事件
- UPMessageInput：输入 change/finish、dotFill 展示、disabledKeyboard
- UPParse：HTML 解析渲染、linktap/imgtap/click payload
- UPNovelReader：滚动模式渲染、进度回传 progress-change、书签增删、设置变更 settings-change

## 边界声明（文档化）

- markdown/parse 的图片预览：uni.previewImage → RN 无，缺省 no-op，`onImgtap` 交还调用方
- novel-reader persist：AsyncStorage 由调用方注入，缺省内存
- parse 的 video/audio：RN 边界（WebView 或 no-op）
- coupon 锯齿裁切：视觉模拟（圆点镂空），非真实裁切
- color-picker 渐变：支持两色线性渐变 + 方向，多点渐变保留接口
