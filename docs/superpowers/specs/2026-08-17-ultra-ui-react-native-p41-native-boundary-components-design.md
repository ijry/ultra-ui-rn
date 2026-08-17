# P41 — 原生依赖边界组件接口骨架（cropper / poster / pdf-reader / short-video）

日期：2026-08-17
阶段：P41（组件接口兼容收官 · 原生边界）
基线：uview-plus@3.8.86（`src/uni_modules/uview-plus/components/`）

## 背景与目标

P0–P40 已复刻 139/140 个源组件。最后 4 个组件依赖 uni-app 的原生能力：

| 组件 | 依赖的原生能力 |
|---|---|
| `u-cropper` | `uni.createCanvasContext` / `uni.getImageInfo` / `uni.canvasToTempFilePath` / 文件系统 |
| `u-poster` | canvas 绘制 + 图片导出 |
| `u-pdf-reader` | web-view 内嵌 pdf.js |
| `u-short-video` | `<video>` 播放器 + 进度条 |

按仓库惯例（P32 上传 adapter、P38 边界声明），这 4 个组件以**接口骨架**落地：props/events/slots/方法名与源完全对齐，UI 与交互逻辑在 RN 可实现的范围内完整实现；原生能力（真实裁剪导出、海报图片、PDF 渲染、视频播放）作为**显式 RN 边界**——不硬编码原生依赖，提供清晰的注入点（slot / 回调 / adapter），文档化。

## 组件接口契约（源审计结果）

### 1. UPCropper（源 u-cropper，42KB，canvas 裁剪）

| prop | type | default |
|---|---|---|
| imageSrc | String | '' |
| minScale | Number | 0.3 |
| maxScale | Number | 4 |
| canScale | Boolean | true |
| canRotate | Boolean | true |
| lockWidth | String | '' |
| lockHeight | String | '' |
| stretch | String | '' |
| lock | String | '' |
| noTab | Boolean | true |
| inner | Boolean | false |
| quality | Number/String | 0.9 |
| index | Number/String | '' |
| canChangeSize | Boolean | false |
| areaWidth | String | '300rpx' |
| areaHeight | String | '300rpx' |
| exportWidth | String | '260rpx' |
| exportHeight | String | '260rpx' |
| fillColor | String | 'transparent' |

事件：`avtinit`（初始化完成）、`confirm({ avatar, path, index, data })`、`cancel`。

RN 实现：图片展示 + 裁剪框（PanResponder 拖动/缩放）+ 确认/取消按钮。`confirm` 返回 `{ avatar: imageSrc, path: null, index, data: { x, y, width, height, destWidth, destHeight } }`（裁剪参数）——**真实图片导出为 RN 边界**（需 react-native-canvas 或原生裁剪模块，调用方注入 `renderCropped` 或监听 `path` 为空时的参数自行处理）。

### 2. UPPoster（源 u-poster，19.6KB，canvas 海报）

| prop | type | default |
|---|---|---|
| json | Object | `{}` |

方法：`exportImage(): Promise<{ path, width, height }>`。

JSON 结构（源）：`{ width, height, background, views: [{ type: 'image'|'text'|'qrcode'|'rect'|'line', css, src/url/text, ... }] }`。

RN 实现：将 json 渲染为 View 布局（image → RN Image、text → Text、rect/line → View、qrcode → 占位/复用 UPQrcode）。`exportImage()` 返回 `Promise.reject` 或 `{ path: null, width, height }`——**真实导出为 RN 边界**（`react-native-view-shot` 或原生模块，调用方可注入 `exportImageAdapter`）。

### 3. UPPdfReader（源 u-pdf-reader，1.6KB，web-view + pdf.js）

| prop | type | default |
|---|---|---|
| src | String | '' |
| height | String | '500px' |
| baseUrl | String | 'https://uview-plus.jiangruyi.com/h5' |

无事件。源用 web-view 加载 baseUrl/pdf 渲染器。

RN 实现：骨架 + 说明文案；**PDF 渲染为 RN 边界**（`react-native-pdf` 或 WebView，调用方注入 `renderPdf` slot）。`src`/`height`/`baseUrl` 接口保留。

### 4. UPShortVideo（源 u-short-video，12KB，video 播放）

| prop | type | default |
|---|---|---|
| tabsList | Array | `[{name:'推荐'},{name:'关注'},{name:'朋友'},{name:'本地'}]` |
| videoList | Array | `[]` |
| currentTab | Number | 0 |
| currentVideo | Number | 0 |

事件：`tabChange(index)`、`videoChange(currentIndex)`、`like({item,index})`、`comment({item,index})`、`share({item,index})`、`collect({item,index})`、`progressChanging({progress,index})`、`progressChange({progress,index})`、`videoPlay({index,event})`、`videoPause({index,event})`、`videoEnded({index,event})`、`timeUpdate({index,event})`、`loadedMetadata({index,event})`。

slots：`menu`（顶部菜单）、`search`（搜索）、视频 item（`renderVideo`）。

RN 实现：**UI 全量实现**（顶部 tabs + 菜单/搜索 slot + 竖滑视频列表 + 右侧点赞/评论/分享/收藏 + 底部进度条 + 播放/暂停）；视频播放器为 RN 边界——提供 `renderVideo(item, index)` slot 让调用方注入 `react-native-video` 或自绘占位，播放器事件（videoPlay/videoPause/videoEnded/timeUpdate/loadedMetadata）由注入的播放器转发。

## 通用映射规则（沿 P35–P40）

1. 组件名：`UPCropper` / `UPPoster` / `UPPdfReader` / `UPShortVideo`
2. props：camelCase 源名原样保留
3. emits → `onXxx` 类型化 closure（`onConfirm`/`onAvtinit`/`onCancel`/`onTabChange`/`onLike`/`onVideoPlay`…）
4. slot → children / `render*` 函数（`renderMenu`/`renderSearch`/`renderVideo`/`renderPdf`）
5. 方法：`exportImage()` 通过 ref 暴露（`useImperativeHandle`）

## 边界声明（文档化）

| 能力 | 源（uni-app） | RN 边界 |
|---|---|---|
| cropper 图片导出 | canvasToTempFilePath | `path` 为 null，返回裁剪参数；调用方用 `react-native-canvas` 或原生模块 |
| poster 导出 | canvas → 临时图 | `exportImage()` 需注入 adapter（view-shot 类）；缺省返回参数 |
| pdf 渲染 | web-view + pdf.js | 需注入 `renderPdf`（react-native-pdf / WebView） |
| video 播放 | `<video>` | 需注入 `renderVideo`（react-native-video）；播放器事件由注入层转发 |
| qrcode 绘制 | canvas | 复用 `UPQrcode`（已有实现） |

## 测试计划

- 每组件 ≥1 个测试：props 默认值、事件 payload、slot 注入、ref 方法
- UPCropper：confirm payload 含裁剪参数、cancel、avtinit
- UPPoster：json 渲染布局、exportImage 缺省行为
- UPPdfReader：渲染占位、renderPdf slot
- UPShortVideo：tab 切换事件、like/comment/share/collect payload、videoChange、renderVideo 注入

## 完成后状态

源 140 个组件全部有本地对应（139 个完整复刻 + 4 个边界骨架覆盖其中 3 个新实现 + pdf-reader 骨架），接口兼容目标达成；剩余原生能力以注入点 + 文档化边界收敛。
