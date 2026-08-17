# React Native P8 Static Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the stable uview-plus `u-table`, `u-tr`, `u-th`, and `u-td` component family with source-default styles and parent-child style inheritance.

**Architecture:** `UPTable` resolves source defaults through subscribable `UP.props` and provides resolved border, alignment, padding, typography, header, and background values through React context. `UPTr` is a source row flex surface. `UPTh` and `UPTd` consume the nearest table context while accepting their source per-cell width and override properties. Primitive children become native Text so source string slots remain valid React Native content.

**Tech Stack:** React 19, React Native 0.86 core View/Text, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults and use `UP*` PascalCase exports.
- Add all default tables to `UP.props` and merge overrides in `setUPConfig`.
- Convert source dimensions through `getPx`; retain unavailable source properties as documented no-ops.
- Do not add third-party native UI dependencies.
- This phase targets `u-table`; defer the distinct `u-table2` sortable/tree/fixed-column data grid to its own plan.

---

### Task 1: Table Context and Static Table Components

**Files:**
- Create: `src/components/table/context.ts`, `src/components/table/UPTable.tsx`, `src/components/table/UPTr.tsx`, `src/components/table/UPTh.tsx`, `src/components/table/UPTd.tsx`, `src/components/table/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPStaticTable.test.tsx`

**Interfaces:**
- `UPTableProps` accepts source `borderColor`, `align`, `padding`, `fontSize`, `color`, `thStyle`, `bgColor`, `children`, and native custom style props.
- `UPTrProps` renders a source flex row.
- `UPThProps` accepts source percentage/dimension `width`; `UPTdProps` accepts source `width`, `textAlign`, `fontSize`, `borderColor`, and `color` overrides.
- `UPTableContextValue` contains resolved source styles needed by `UPTh` and `UPTd`.

- [ ] **Step 1: Write failing source inheritance tests**

```tsx
const screen = renderRoot(
  <UPTable align="left" borderColor="#123456" color="#234567" fontSize="16px" padding="8px 6px">
    <UPTr><UPTh width="40%">Name</UPTh><UPTh>Score</UPTh></UPTr>
    <UPTr><UPTd width="40%">Ada</UPTd><UPTd color="#ff0000">98</UPTd></UPTr>
  </UPTable>,
);
expect(flatten(screen.getByTestId('up-table').props.style)).toMatchObject({ borderLeftColor: '#123456' });
expect(flatten(screen.getAllByTestId('up-td')[1].props.style)).toMatchObject({ color: '#ff0000' });
```

- [ ] **Step 2: Run the focused suite to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPStaticTable.test.tsx`

Expected: FAIL because static table exports are unavailable.

- [ ] **Step 3: Implement config defaults, context, and source surfaces**

```tsx
const cellWidth = input.width === 'auto' || !input.width ? undefined : resolveWidth(input.width);
return <View style={{ flex: cellWidth ? undefined : 1, flexBasis: cellWidth }} />;
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPStaticTable.test.tsx && npm run typecheck`

Expected: PASS.

### Task 2: Documentation, Example, and Quality Gates

**Files:**
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx`
- Test: root and example suites

- [ ] **Step 1: Add a source table example**

```tsx
<UPTable>
  <UPTr><UPTh width="50%">Metric</UPTh><UPTh>Value</UPTh></UPTr>
  <UPTr><UPTd width="50%">Orders</UPTd><UPTd>128</UPTd></UPTr>
</UPTable>
```

- [ ] **Step 2: Document React Native static-table limits**

Document primitive child text wrapping, ReactNode child style boundaries, CSS `customClass` no-op behavior, and that data-grid-only `u-table2` remains deferred.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all commands exit zero.

- [ ] **Step 4: Run example quality gates**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: all commands exit zero.
