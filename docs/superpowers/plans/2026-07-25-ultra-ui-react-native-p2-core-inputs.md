# React Native P2 Core Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the React-Native-core-compatible part of uview-plus P2: text inputs, search, switches, checkbox/radio groups, rate, number box, code input, and form validation containers.

**Architecture:** Add exact uview source defaults to the subscribable `UP.props` table. Input components expose controlled `value`/`modelValue` and `onChange` mappings while retaining unavailable uni-app props as documented no-ops. Selection controls use React contexts for group defaults/state. `UPForm` owns a typed field registry and exposes source-shaped imperative validation handles through `forwardRef`; `UPFormItem` reports source validation rules to that registry.

**Tech Stack:** React 19, React Native 0.86, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; do not create a commit without explicit user instruction.
- Source of truth is uview-plus `3.8.86` at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults and use `onChange` as the React Native equivalent for Vue `update:modelValue`/`change`.
- All platform-only props stay typed and documented as no-ops; no completed component silently drops public source API.
- Use source `getPx` metrics, source colors, and apply `customStyle` last.

---

## Task 1: P2 Defaults and Shared Control Context

**Files:**
- Modify: `src/config/defaults.ts`, `src/config/store.ts`
- Create: `src/components/form/context.ts`, `src/components/selection-context.ts`
- Test: `tests/components/UPInputs.test.tsx`

**Interfaces:**
- Produces default records for `input`, `textarea`, `search`, `switch`, `checkbox`, `checkboxGroup`, `radio`, `radioGroup`, `rate`, `slider`, `numberBox`, `codeInput`, `form`, and `formItem`.
- Produces selection contexts with source palette, placement, disabled state, and controlled value change callbacks.

- [ ] Write failing default-override tests, run them, add source default tables/config merging/context types, then rerun focused tests.

## Task 2: Input, Textarea, and Search

**Files:**
- Create: `src/components/input/*`, `src/components/textarea/*`, `src/components/search/*`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPInputs.test.tsx`

**Interfaces:**
- Produces `UPInput`, `UPTextarea`, `UPSearch` with `value`/`modelValue`, `defaultValue`, `onChange`, `onFocus`, `onBlur`, `onConfirm`, and source-compatible clear behavior.

- [ ] Test formatter, maxlength, clear, password visibility, word count, input type mapping, search action/cancel.
- [ ] Implement with native `TextInput`, preserving source borders, shapes and icon slots via ReactNode props.
- [ ] Mark mini-program keyboard/cursor props, CSS classes and host keyboard controls as no-ops.

## Task 3: Switches, Checkbox/Radio, Rate, Number Box, and Code Input

**Files:**
- Create: `src/components/switch/*`, `src/components/checkbox/*`, `src/components/radio/*`, `src/components/rate/*`, `src/components/number-box/*`, `src/components/code-input/*`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPSelectionControls.test.tsx`

**Interfaces:**
- Produces group/child controlled value APIs, explicit `onChange` payloads, source defaults, disabled/async semantics, and named item callbacks.

- [ ] Test all selected/unselected callbacks, group inheritance, active/inactive values, range/min/max, half-rate, code input completion.
- [ ] Implement groups using React context, preserving `modelValue` aliases and `defaultValue` for standalone uncontrolled controls.
- [ ] Treat long-press, slider custom/native modes, and native keyboard props as explicit emulation/no-op entries where RN core differs.

## Task 4: Form and Form Item Validation

**Files:**
- Create: `src/components/form/UPForm.tsx`, `src/components/form/UPFormItem.tsx`, `src/components/form/index.ts`
- Test: `tests/components/UPForm.test.tsx`

**Interfaces:**
- Produces `UPFormRef` methods `validate`, `validateField`, `resetFields`, and `clearValidate`.
- Consumes model objects and source-style rules `{ required, message, pattern, min, max, validator, trigger }`.

- [ ] Write tests for required/pattern/custom validator errors and source `message`/`border-bottom` presentation.
- [ ] Implement registered form items with typed errors, source label positions, required marker, and independent item rules.
- [ ] Mark source toast validation presentation as an overlay-dependent emulation until P3 toast is complete.

## Task 5: Docs, Example, and Quality Gates

**Files:**
- Modify: `docs/gap-matrix.md`, `docs/compatibility.md`, `README.md`, `example/App.tsx`
- Test: P2 suites

- [ ] Add P2 showcase state with controlled input, checkbox/radio, switch, number box, code input, and validation submit.
- [ ] Record all P2 source API props/events/slots with Supported, Emulated, or No-op retained status.
- [ ] Run `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`.
- [ ] Run example `npx tsc --noEmit && npm run lint && npm test -- --runInBand`.
