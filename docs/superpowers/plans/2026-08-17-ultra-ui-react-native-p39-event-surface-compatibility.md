# P39 事件面兼容补齐 — 实施计划

前置：审计脚本（`/tmp/uupload/audit2.mjs` props、`events-audit.mjs` events）已产出缺口清单。

## Commit 1 — contracts：事件与 prop 类型契约

- `radio`：加 `color?: string`（图标颜色，`iconColor ?? color`）
- `input`：加 `onInput`、`onKeyboardheightchange`、`onNicknamereview`（边界）、`ignoreCompositionEvent`（边界）
- `textarea`：加 `onInput`、`onLinechange`、`onKeyboardheightchange`
- `code-input`/`rate`/`switch`/`search`/`datetime-picker`/`waterfall`：加 `onInput`
- `number-box`：加 `onFocus/onInput/onOverlimit/onPlus/onMinus`
- `card`：加 `onClick/onHeadClick/onBodyClick/onFootClick`
- `popup`：加 `onClick`
- `modal`：加 `onCancelOnAsync`
- `slider`：加 `onInput/onStart`
- `barcode`：加 `onRendered`
- `canvas`：加 `onTouchstart/onTouchmove/onTouchend`（小写源别名）
- `list`：加 `onScrolltolower/onScrolltoupper/onRefresherpulling/onRefresherrefresh/onRefresherrestore/onRefresherabort`（源别名）

## Commit 2 — 组件实现

- number-box：plus/minus/overlimit 边界判断；focus/input 透传
- card：整卡/头部/主体/底部可点，payload=index
- popup：内容区 Pressable → onClick
- modal：asyncClose + loading 状态 → cancelOnAsync
- slider：onStart（按压开始）、onInput（值）
- barcode：绘制成功 → onRendered({ type:'canvas', id })
- canvas：touch 小写别名转发
- list：scrolltolower/scrolltoupper 与现有 edge 检测联动；refresher 源别名
- input/textarea：onInput 别名；keyboardheightchange 用 RN Keyboard 事件
- 其余：onInput 值别名与 onChange 同刻触发

## Commit 3 — 测试

- 新增/扩展：number-box、card、popup、modal、slider、barcode、list、input、switch、rate、search、datetime-picker、waterfall、code-input、textarea、radio

## Commit 4 — 文档

- gap-matrix.md：P39 行（事件面缺口清零）
- compatibility.md：事件命名规则（源小写驼峰保留）、divergence 表
- README：P39 条目

## 质量门

- `npm test`、`npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check`
