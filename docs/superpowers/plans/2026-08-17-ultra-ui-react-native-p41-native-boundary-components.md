# P41 — 原生依赖边界组件接口骨架：实施计划

## Commit 1 — cropper + pdf-reader

- `src/components/cropper/`：
  - `UPCropper.tsx`：图片 + 裁剪框（PanResponder 拖动/缩放）+ 确认/取消；`onAvtinit`/`onConfirm`/`onCancel`
  - confirm payload `{ avatar, path: null, index, data: { x, y, width, height, destWidth, destHeight } }`
  - types + index
- `src/components/pdf-reader/`：
  - `UPPdfReader.tsx`：src/height/baseUrl + 占位提示 + `renderPdf` slot
  - types + index
- defaults：cropper、pdfReader

## Commit 2 — poster + short-video

- `src/components/poster/`：
  - `UPPoster.tsx`：json → View 布局（image/text/rect/line/qrcode）+ `exportImage()`（ref，缺省返回参数，支持 `exportImageAdapter` 注入）
  - types + index
- `src/components/short-video/`：
  - `UPShortVideo.tsx`：顶部 tabs + menu/search slot + 视频列表 + 右侧操作列 + 进度条 + `renderVideo` slot；事件全量转发（tabChange/videoChange/like/comment/share/collect/progressChange/videoPlay/…）
  - types + index
- defaults：poster、shortVideo

## Commit 3 — 测试

- `tests/components/UPCropper.test.tsx`：confirm payload / cancel / avtinit
- `tests/components/UPPdfReader.test.tsx`：占位渲染 / renderPdf slot
- `tests/components/UPPoster.test.tsx`：json 渲染 / exportImage 缺省
- `tests/components/UPShortVideo.test.tsx`：tab / like / comment / videoChange / renderVideo

## Commit 4 — 文档与导出

- `src/components/index.ts` + `src/index.ts` 导出 4 个新组件
- gap-matrix.md：P41 行（源 140 组件全覆盖）
- compatibility.md：P41 边界注入表
- README：P41 条目（140/140 达成）
- example/App.tsx：补 4 个组件 demo

## 质量门

`npm test`、`npm run typecheck`、`npm run lint`、`npm run build`、example tsc、`git diff --check`
