# P22 Index List PanResponder Design

**Goal:** Extend `UPIndexList` with native continuous index-rail dragging while preserving measured click jumps, source callback identity, and accessible discrete rail controls.

## Scope

- Port the upstream `u-index-list` touch-start, touch-move, and touch-end rail behavior through React Native core `PanResponder`.
- Keep existing rail `Pressable` controls for screen-reader and single-tap operation.
- Do not add dependencies, a floating source-style magnifier, global screen-scroll integration, or CSS behavior.

## Interaction Contract

- A rail item press remains an animated measured jump to its registered group and emits the exact source `UPIndexValue` through `onSelect`.
- A vertical movement greater than 2 px captures the parent rail responder. Dragging resolves the closest rail item from native rail-item layouts, clamps above/below the rail to the first/last item, emits only when the resolved index changes, and scrolls registered groups with `animated: false`.
- `onSelect` preserves primitive and object identity. Unregistered groups still become active and emit selection, but do not call `scrollTo`.
- Responder release or termination only ends dragging; it does not emit another selection or initiate another scroll.
- Scroll-derived active-state updates are suspended while the rail responder owns the drag, matching the source component's `touching` guard.

## Architecture

`UPIndexList` continues to own `ScrollView`, group position registry, and active state. It adds refs for the active key, drag state, native rail origin, rail layout, and per-item rail layouts. A single `activateIndex(index, animated)` function updates active state, emits source selection only for an actual key transition, and performs a measured `scrollTo` only when the target group is registered.

The rail container receives `PanResponder.panHandlers`. Its start callbacks return false so child `Pressable` controls retain ordinary tap and accessibility behavior. `onMoveShouldSetPanResponderCapture` claims a clearly vertical gesture; responder grant and move map the native touch position to a rail item. The mapping uses measured item centers when available and falls back to equal row height only before layout is reported.

## Error Handling and Compatibility

- Missing layout data uses the deterministic 18 px source rail pitch fallback rather than rejecting a drag.
- A native `measureInWindow` result is used when available; responder `locationY` remains the test and layout fallback.
- Existing `customNavHeight`, object rail values, default A-Z rail, active colors, `sticky`, `safeBottomFix`, and `customClass` contracts remain unchanged.

## Test Strategy

- Retain current click, measured jump, object identity, and scroll-derived active-state tests.
- Invoke generated responder handlers in the component test to prove the capture threshold, first/last clamping, non-animated registered jumps, no duplicate emission for the same rail item, and no release emission.
- Validate the focused suite, package typecheck, lint, build, example TypeScript/lint/render suite, and final package gate.
