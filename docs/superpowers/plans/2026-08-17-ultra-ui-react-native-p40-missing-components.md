# P40 — 复刻剩余纯 JS 组件：实施计划

## Commit 1 — 轻量组件（action-sheet-data / coupon / message-input）

- `UPCodeInput` 模式复用：`src/components/action-sheet-data/`（UPActionSheetData + types + index）
- `src/components/coupon/`（UPCoupon + types + index）
- `src/components/message-input/`（UPMessageInput + types + index）
- 全部走源 props/events 契约（见设计稿）
- 测试：UPCodeInputInput 同风格（fireEvent 交互 + payload 断言）

## Commit 2 — 复杂选择器（color-picker / goods-sku）

- `src/components/color-picker/`：
  - `color.ts`：HSV↔HEX 换算、hex 归一化、渐变插值
  - `UPColorPicker.tsx`：色相条（PanResponder）+ 饱和度/明度面板 + 透明度条 + 常用色板 + 渐变模式
  - emits：`onChange/onInput`（值）、`onConfirm`、`onClose`
- `src/components/goods-sku/`：
  - `sku.ts`：可选性矩阵计算（选中组合 → 可用项）
  - `UPGoodsSku.tsx`：规格区 + 数量器（复用 UPNumberBox 思路或内联）+ 确认/关闭
  - emits：`onOpen`/`onClose`/`onConfirm`

## Commit 3 — 渲染类（markdown / parse）

- `src/components/markdown/`：
  - `parser.ts`：轻量 Markdown 块级/行内解析（零依赖）
  - `UPMarkdown.tsx`：嵌套 Text/View 渲染，`onLoad/onReady/onImgtap/onLinktap/onPlay/onError`
- `src/components/parse/`：
  - `htmlParser.ts`：移植源 parser.js 的 HTML→节点树（p/div/h1-h6/a/img/ul/ol/li/table/br/strong/em/u/del/span）
  - `UPParse.tsx`：节点树 → Text/View 渲染；`onClick`（节点 detail）/`onLinktap`/`onImgtap`/`onReady`

## Commit 4 — novel-reader

- `src/components/novel-reader/`：
  - `types.ts`：Chapter/Progress/Bookmark/Settings/themeTokens
  - `layout.ts`：段落归一化 + 分页切片（onTextLayout 测量）
  - `UPNovelReader.tsx`：scroll/page 双模式、工具栏、目录、设置面板、书签
  - emits：主 11 事件 + 子面转发（onPageChange/onNext/onPrevious/onToggleControls…）
- `UP.setConfig({ storage })` 注入点（复用 P38 移除后的 config 结构——检查 UP 命名空间是否已有合适挂点，无则新增 `UP.setStorage`）

## Commit 5 — 测试

- 每个新组件 ≥1 测试文件（8 个）
- 覆盖：默认值、核心交互、事件 payload、边界（disabled/closeable/不可用规格项）

## Commit 6 — 文档与导出

- `src/components/index.ts` + `src/index.ts` 导出 8 个新组件
- gap-matrix.md：P40 行（剩余 8 组件清零）
- compatibility.md：新组件映射规则 + divergence（锯齿裁切/图片预览/persist/video）
- README：P40 条目
- example/App.tsx：补 8 个组件 demo（含 P41 前最后一批）

## 质量门

`npm test`、`npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check`
