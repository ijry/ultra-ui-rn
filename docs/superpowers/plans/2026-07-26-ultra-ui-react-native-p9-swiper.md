# React Native P9 Swiper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the stable `u-swiper` and `u-swiper-indicator` family with source defaults, controlled current-index callbacks, and React Native core pagination.

**Architecture:** `UPSwiper` resolves source defaults from subscribable `UP.props`, renders the source list through a paged native `ScrollView`, and centralizes each user or timer-driven index transition through one callback path. `UPSwiperIndicator` is a standalone source-compatible line/dot surface used by the default swiper indicator, while `renderItem` and `renderIndicator` map the source default and named slots to React render functions.

**Tech Stack:** React 19, React Native 0.86 core `ScrollView`, `Image`, `Pressable`, and timers; TypeScript 5.9; Jest; React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a worktree or commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults and use `UP*` PascalCase exports.
- Add all default tables to subscribable `UP.props` and merge overrides in `setUPConfig`, so mounted components react to `UP.setConfig()`.
- Convert source dimensions through `getPx`; retain unavailable source properties as documented no-ops.
- Do not add third-party native UI dependencies.
- Default image slides use native `Image`; a source video item requires `renderItem` because React Native core has no video renderer.
- `circular` wraps timer-driven transitions; a core `ScrollView` cannot provide source-equivalent infinite drag looping without duplicate slide copies and gesture reconciliation.

---

### Task 1: Source Indicator and Configuration

**Files:**
- Create: `src/components/swiper/UPSwiperIndicator.tsx`, `src/components/swiper/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPSwiper.test.tsx`

**Interfaces:**
- Produces `UPSwiperIndicatorProps` with `length?: number | string`, `current?: number | string`, `indicatorActiveColor?: string`, `indicatorInactiveColor?: string`, `indicatorMode?: 'line' | 'dot'`, and React Native `customStyle`.
- Produces `UPSwiperIndicator`, which renders `up-swiper-indicator-line` for line mode and `up-swiper-indicator-dot-{index}` for dot mode.
- Adds `UPProps['swiper']` and `UPProps['swiperIndicator']` source defaults and corresponding partial override entries to `UPConfigOverrides['props']`.

- [ ] **Step 1: Write failing indicator/default tests**

```tsx
import { StyleSheet } from 'react-native';
import { UP, UPSwiperIndicator } from '../../src';

it('renders source line and dot indicator states and reacts to UP config', () => {
  const screen = renderRoot(<UPSwiperIndicator current={1} length={3} />);
  expect(StyleSheet.flatten(screen.getByTestId('up-swiper-indicator-line').props.style))
    .toEqual(expect.objectContaining({ width: 66 }));

  screen.rerender(<UPRoot><UPSwiperIndicator current={1} indicatorMode="dot" length={3} /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-swiper-indicator-dot-1').props.style))
    .toEqual(expect.objectContaining({ width: 12 }));
  UP.setConfig({ props: { swiperIndicator: { indicatorActiveColor: '#123456' } } });
  expect(StyleSheet.flatten(screen.getByTestId('up-swiper-indicator-dot-1').props.style))
    .toEqual(expect.objectContaining({ backgroundColor: '#123456' }));
});
```

- [ ] **Step 2: Run the focused test to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPSwiper.test.tsx`

Expected: FAIL because `UPSwiperIndicator` and its defaults are unavailable.

- [ ] **Step 3: Add source defaults and a native indicator surface**

```tsx
export type UPSwiperIndicatorDefaults = {
  length: number;
  current: number;
  indicatorActiveColor: string;
  indicatorInactiveColor: string;
  indicatorMode: 'line' | 'dot';
};

const current = Math.max(0, Math.min(length - 1, Number(props.current) || 0));
const lineStyle: ViewStyle = {
  backgroundColor: props.indicatorActiveColor,
  borderRadius: 100,
  height: 4,
  transform: [{ translateX: current * 22 }],
  width: 22,
};
```

Add `swiperIndicator` to the `UPProps` type, `sourceDefaults.props`, `createSourceState`, and every `setUPConfig` merge path. Use `useUPConfig()` inside the indicator so `UP.setConfig()` updates an already mounted indicator.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPSwiper.test.tsx && npm run typecheck`

Expected: PASS for indicator tests and TypeScript.

### Task 2: Core Source Swiper

**Files:**
- Create: `src/components/swiper/UPSwiper.tsx`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/swiper/index.ts`
- Test: `tests/components/UPSwiper.test.tsx`

**Interfaces:**
- Produces `UPSwiper`, `UPSwiperProps`, `UPSwiperItem`, and `UPSwiperChangeEvent` from the package root.
- `UPSwiperProps` preserves source props `list`, `indicator`, `indicatorActiveColor`, `indicatorInactiveColor`, `indicatorStyle`, `indicatorMode`, `autoplay`, `current`, `currentItemId`, `interval`, `duration`, `circular`, `vertical`, `previousMargin`, `nextMargin`, `acceleration`, `displayMultipleItems`, `easingFunction`, `keyName`, `imgMode`, `height`, `bgColor`, `radius`, `loading`, and `showTitle`.
- React mappings are `renderItem?: (item, index) => ReactNode`, `renderIndicator?: (current, length) => ReactNode`, `onClick?: (index) => void`, `onChange?: (event: UPSwiperChangeEvent) => void`, and `onUpdateCurrent?: (current: number) => void`.

- [ ] **Step 1: Extend the focused suite with source event and geometry assertions**

```tsx
it('maps source scroll changes, item presses, controlled updates, and autoplay', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  const onClick = jest.fn();
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(
    <UPSwiper
      autoplay
      circular
      current={0}
      indicator
      interval={100}
      list={['https://example.test/one.png', 'https://example.test/two.png']}
      onChange={onChange}
      onClick={onClick}
      onUpdateCurrent={onUpdateCurrent}
    />,
  );

  fireEvent.press(screen.getByTestId('up-swiper-item-1'));
  expect(onClick).toHaveBeenCalledWith(1);
  fireEvent(screen.getByTestId('up-swiper-scroll'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 320, y: 0 }, layoutMeasurement: { width: 320, height: 130 } },
  });
  expect(onChange).toHaveBeenCalledWith({ current: 1 });
  expect(onUpdateCurrent).toHaveBeenCalledWith(1);
  jest.advanceTimersByTime(100);
  expect(onChange).toHaveBeenLastCalledWith({ current: 0 });
  jest.useRealTimers();
});
```

- [ ] **Step 2: Run the focused suite to verify the swiper export fails**

Run: `npm test -- --runInBand tests/components/UPSwiper.test.tsx`

Expected: FAIL because `UPSwiper` is unavailable.

- [ ] **Step 3: Implement paged source slides and index transitions**

```tsx
function transitionTo(nextIndex: number, notify: boolean): void {
  const current = normalizeIndex(nextIndex, props.list.length);
  setCurrentIndex(current);
  scrollToIndex(current);
  if (notify) {
    const event = { current };
    input.onUpdateCurrent?.(current);
    input.onChange?.(event);
  }
}

useEffect(() => {
  if (!props.autoplay || props.loading || props.list.length < 2) return undefined;
  const timer = setInterval(() => {
    const next = currentIndex + 1;
    if (next < props.list.length) transitionTo(next, true);
    else if (props.circular) transitionTo(0, true);
  }, Math.max(1, Number(props.interval) || 3000));
  return () => clearInterval(timer);
}, [currentIndex, props.autoplay, props.circular, props.interval, props.list.length, props.loading]);
```

Use a native `ScrollView` with `horizontal={!props.vertical}`, `pagingEnabled`, `onMomentumScrollEnd`, and a stable `up-swiper-scroll` test ID. Compute the next index from the relevant content offset divided by the measured item span. Read `current` through a synchronization effect without emitting callbacks for parent-driven changes. Render default string/object image sources with native `Image`; use `renderItem` for custom slides and videos. Render a `UPLoadingIcon` when `loading` is true, source title overlays when `showTitle` is true, and the custom/default indicator only when source conditions allow it.

- [ ] **Step 4: Run focused tests, typecheck, and lint**

Run: `npm test -- --runInBand tests/components/UPSwiper.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

### Task 3: Documentation, Example, and Quality Gates

**Files:**
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx`
- Test: root and example suites

**Interfaces:**
- Documents `UPSwiper`/`UPSwiperIndicator` source mappings, `renderItem`, `renderIndicator`, and the React Native core limits for video, drag-looping, CSS class styles, easing, acceleration, and exact duration.

- [ ] **Step 1: Add a controlled source swiper example**

```tsx
const [slide, setSlide] = useState(0);

<UPSwiper
  current={slide}
  indicator
  list={[
    { title: 'Spring collection', url: 'https://picsum.photos/seed/spring/800/320' },
    { title: 'Summer collection', url: 'https://picsum.photos/seed/summer/800/320' },
  ]}
  onUpdateCurrent={setSlide}
/>
```

- [ ] **Step 2: Document native compatibility limits**

Document that `renderItem` replaces the Vue default item slot and `renderIndicator` replaces the indicator slot. State that native core does not include a video renderer, custom easing, source-duration control, or source-equivalent infinite drag looping; `currentItemId`, `acceleration`, `easingFunction`, string `indicatorStyle`, and CSS `customClass` stay typed and documented no-ops. State that `previousMargin`, `nextMargin`, and `displayMultipleItems` are core ScrollView geometry approximations.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all commands exit zero.

- [ ] **Step 4: Run example quality gates**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: all commands exit zero.
