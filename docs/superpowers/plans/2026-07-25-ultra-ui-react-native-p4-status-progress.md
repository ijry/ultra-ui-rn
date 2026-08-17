# React Native P4 Status and Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port source-compatible static and time-driven state components: line progress, circle progress fallback, count down, count to, and loadmore.

**Architecture:** Every component receives source default values through the subscribable `UP.props` store. Progress and loadmore render using RN core views; count components own typed `forwardRef` methods and timer lifecycle, with deterministic Jest fake-timer tests. The circle progress is an RN-core border/text approximation until a vector adapter is supplied.

**Tech Stack:** React 19, React Native 0.86 core Views/Text/ActivityIndicator, TypeScript 5.9, Jest fake timers, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults/events and use `UP*` PascalCase exports.
- Add all default tables to `UP.props` and merge overrides in `setUPConfig`.
- Use `getPx`, source colors, and document every RN-core emulation/no-op.
- `UPBackTop` and `UPSticky` remain deferred: correct behavior requires a consumer scroll-container adapter rather than undocumented global scroll assumptions.

---

### Task 1: Defaults, Line/Circle Progress, and Loadmore

**Files:**
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Create: `src/components/line-progress/UPLineProgress.tsx`, `src/components/line-progress/index.ts`, `src/components/circle-progress/UPCircleProgress.tsx`, `src/components/circle-progress/index.ts`, `src/components/loadmore/UPLoadmore.tsx`, `src/components/loadmore/index.ts`
- Test: `tests/components/UPProgressStatus.test.tsx`

**Interfaces:**
- `UPLineProgressProps` supports all source active/inactive colors, percentage, showText, height and `fromRight`.
- `UPCircleProgressProps` retains the source `percentage` API and renders an RN-core approximation.
- `UPLoadmoreProps` supports all source status/text/icon/line/dimension props.

- [ ] Write failing tests for percentage clamping/from-right, circle percentage text, and source loadmore loading/nomore labels.
- [ ] Run `npm test -- --runInBand tests/components/UPProgressStatus.test.tsx`; verify missing-export failure.
- [ ] Add exact source defaults and config merge keys; render progress/line/loadmore surfaces with `getPx` metrics.
- [ ] Run the focused suite and `npm run typecheck`; verify green.

---

### Task 2: Count Down and Count To

**Files:**
- Create: `src/components/count-down/UPCountDown.tsx`, `src/components/count-down/index.ts`, `src/components/count-to/UPCountTo.tsx`, `src/components/count-to/index.ts`, `src/components/count-down/time.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPProgressStatus.test.tsx`

**Interfaces:**
- `UPCountDownRef { start(): void; pause(): void; reset(): void }`, source `change(timeData)` and `finish()` map to `onChange` and `onFinish`.
- `UPCountToRef { start(): void; pause(): void; resume(): void; reset(): void }`, source `end()` maps to `onEnd`.

- [ ] Write fake-timer failing tests that assert formatted source countdown data, ref pause/reset, count-to final formatted value and `onEnd`.
- [ ] Run the focused suite; verify the new APIs are unavailable.
- [ ] Implement time parsing/formatting and timer cleanup; animate `UPCountTo` on a fixed RN-safe interval with source easing and decimal/separator options.
- [ ] Run focused tests and `npm run typecheck`; verify all assertions green.

---

### Task 3: P4 Documentation, Example, and Quality Gates

**Files:**
- Modify: `docs/gap-matrix.md`, `docs/compatibility.md`, `README.md`, `example/App.tsx`
- Test: root and example suites

- [ ] Add controlled progress, countdown and loadmore states to the example.
- [ ] Add matrix rows for every P4 source API, explicitly marking circle progress as RN-core emulated and sticky/backtop deferred.
- [ ] Run `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`.
- [ ] From `example/`, run `npx tsc --noEmit && npm run lint && npm test -- --runInBand`.
