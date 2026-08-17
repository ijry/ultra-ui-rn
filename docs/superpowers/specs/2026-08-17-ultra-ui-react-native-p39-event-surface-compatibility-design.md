# P39 全量接口差距审计与事件面补齐（设计稿）

## 背景与目标

P0–P38 已让全部 91 个组件的 **props 面**达到源兼容。本阶段对 uview-plus@3.8.86 做一次**全量接口差距审计**（props + events 两个维度），把剩余的真实缺口补齐，把不可复刻项明确为 RN 边界，最终达到"全部组件接口兼容"。

## 审计方法

- 拉取 uview-plus@3.8.86 全部 91 个组件的 `props.js` 与 `.vue`（源码全量）。
- 脚本比对：源 `props.js` 的 prop 名 vs 本地 `UPXxxProps` 类型键（支持单行、多 prop 同行、`X & {...}` 交叉基类、泛型 `Props<T>`、JSDoc 注释剥离）。
- 脚本比对：源 `.vue` 的 `emit('xxx')`（含 `update:modelValue`、连字符事件名）→ 映射 `onXxx` 回调，vs 本地类型。

## 审计结论

### props 面（已 99.9% 完成）

| 组件 | 缺口 | 处理 |
| --- | --- | --- |
| `radio` | `color`（图标颜色） | 实现：`iconColor ?? color` |
| `input` | `ignoreCompositionEvent` | RN 边界：声明 + 文档 |

其余 89 个组件 props 面零缺口（含上一轮已补的 button/loading-icon/swiper/list/popup/read-more 等全部源 prop）。

### events 面（本阶段主体）

源事件 → 回调映射规则：`emit('change') → onChange`；`emit('update:modelValue') → onUpdateModelValue`；`emit('scrolltolower') → onScrolltolower`（**保留源小写驼峰，不做 RN 化改名**，保证源代码 `@scrolltolower="fn"` 可直接迁移为 `onScrolltolower={fn}`）。

| 组件 | 缺口事件 | 处理 |
| --- | --- | --- |
| `number-box` | `focus/input/overlimit/plus/minus` | 实现 |
| `card` | `click/head-click/body-click/foot-click` | 实现（payload = index） |
| `popup` | `click` | 实现（内容区点击） |
| `modal` | `cancelOnAsync` | 实现（asyncClose + loading 时点取消） |
| `slider` | `input/start` | 实现 |
| `barcode` | `rendered` | 实现（绘制完成） |
| `canvas` | `touchstart/touchmove/touchend`（小写别名） | 实现（转发到现有 onTouchStart/Move/End） |
| `list` | `scrolltolower/scrolltoupper`（源别名）、`refresherpulling/refresh/restore/abort`（源别名） | 实现转发；refresher 生命周期按 RN 能力声明 |
| `input` | `input`、`keyboardheightchange` | 实现；`nicknamereview` 为微信边界声明 |
| `textarea` | `input`、`linechange`、`keyboardheightchange` | 实现/声明 |
| `code-input` | `input` | 实现（值别名） |
| `datetime-picker` | `input` | 实现（值别名） |
| `rate` | `input` | 实现（值别名） |
| `search` | `input` | 实现（值别名） |
| `switch` | `input` | 实现（值别名） |
| `waterfall` | `input` | 实现（值别名） |

### 已覆盖确认

- `table2`/`tree`（P35/P36 深度审计）：全部事件已覆盖（onSelect/onCheck/onRowClick/onCurrentChange 等），审计脚本因泛型 Props 跳过，人工确认无缺口。
- 其余 ~60 个组件事件面零缺口。
- `shared` 不是组件（共享工具），不参与。

## 实现原则（延续 P32–P38 双表面）

1. **RN 表面不变**：现有回调（onChange/onTouchStart/onScrollToLower 等）行为与签名保持，仅新增源事件别名。
2. **源事件名保留源命名**：`onScrolltolower`、`onTouchstart` 与 RN 表面 `onScrollToLower`、`onTouchStart` 并存，二者同时触发。
3. **v-model 事件**：`input` 事件按"值变更即时触发"实现，与 RN `onChange` 同刻触发；`change` 的"失焦提交"语义差异记为 documented divergence。
4. **不可复刻项**（`nicknamereview`、`refresherpulling/restore/abort` 生命周期、`keyboardheightchange` 的键盘动画细节）声明 + 文档化，不伪造行为。

## 验收

- typecheck / lint / 全量测试通过。
- 新增事件测试：number-box、card、popup、modal、slider、barcode、list、input、switch、rate、search、datetime-picker、waterfall、code-input、textarea、radio.color。
- 更新 gap-matrix / compatibility / README。
