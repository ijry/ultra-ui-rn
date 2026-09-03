/**
 * Shared styles and helpers for all component demo pages.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  type ViewStyle,
} from 'react-native';
import { UPSubsection } from 'ultra-ui-rn';

/* ─── Layout ─── */

/**
 * The demo host owns the single vertical scroller and shares its ref here, so a
 * page that needs to scroll programmatically (e.g. UPParse's `navigateTo`
 * anchors) can reach it. Nesting another ScrollView per page would leave the
 * inner one with no scrollable extent, which silently breaks `scrollTo`.
 */
export const DemoScrollContext = React.createContext<React.RefObject<ScrollView | null> | null>(null);

export function useDemoScrollRef(): React.RefObject<ScrollView | null> | null {
  return React.useContext(DemoScrollContext);
}

/** A page body. The host provides the scroller; this only adds the page padding. */
export function DemoPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={s.containerContent}>{children}</View>;
}

/**
 * Mirrors `.u-demo-block` from the upstream demo. Upstream defaults
 * `__content` to `flex(column)` and pages opt into row+wrap per-page via a
 * local style override, so `direction` reproduces that per-page choice.
 */
export function Section({
  title,
  subtitle,
  children,
  direction = 'column',
  contentStyle,
}: {
  title: string;
  /** Upstream `.u-block__title`: a question line between the block title and content. */
  subtitle?: string;
  children: React.ReactNode;
  direction?: 'row' | 'column';
  contentStyle?: ViewStyle;
}) {
  return (
    <View style={s.demoBlock}>
      <Text style={s.demoBlockTitle}>{title}</Text>
      {subtitle ? <Text style={s.blockTitle}>{subtitle}</Text> : null}
      <View
        style={[
          s.demoBlockContent,
          direction === 'row' ? s.demoBlockContentRow : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function Row({
  label,
  children,
  style,
}: {
  label?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[s.row, style]}>
      {label ? <Text style={s.rowLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

export function Value({ label, value }: { label: string; value: string | number | boolean | undefined }) {
  return (
    <View style={s.valueRow}>
      <Text style={s.valueLabel}>{label}</Text>
      <Text style={s.valueText}>{String(value ?? '—')}</Text>
    </View>
  );
}

/**
 * Mirrors `.u-page__item` from the upstream demo — a card-style block used by
 * pages that opt out of `.u-demo-block` (27 of the source demos).
 */
export function PageItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.pageItem}>
      <Text style={s.pageItemTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

/* ─── Param Panel ─── */

/**
 * Reproduces the upstream demos' "参数配置" block, where an `up-subsection`
 * row drives the props of the component rendered above it.
 */
export function ParamPanel({
  label,
  options,
  current,
  onChange,
}: {
  label: string;
  options: readonly string[];
  current: number;
  onChange: (index: number) => void;
}) {
  return (
    <Row label={label} style={s.paramRow}>
      <View style={s.paramControl}>
        <UPSubsection list={options} current={current} onChange={onChange} />
      </View>
    </Row>
  );
}

/* ─── Props Table ─── */

export function PropsTable({
  rows,
}: {
  rows: Array<{ prop: string; type: string; default: string; desc: string }>;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Props</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.cell, s.headerCell, { flex: 1.5 }]}>属性</Text>
          <Text style={[s.cell, s.headerCell, { flex: 1.5 }]}>类型</Text>
          <Text style={[s.cell, s.headerCell]}>默认值</Text>
          <Text style={[s.cell, s.headerCell, { flex: 2 }]}>说明</Text>
        </View>
        {rows.map((row, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.cell, { flex: 1.5 }]}>{row.prop}</Text>
            <Text style={[s.cell, s.typeCell, { flex: 1.5 }]}>{row.type}</Text>
            <Text style={[s.cell]}>{row.default}</Text>
            <Text style={[s.cell, { flex: 2 }]}>{row.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── Event Log ─── */

export function EventLog({ events }: { events: string[] }) {
  if (!events.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>事件日志</Text>
      <View style={s.demoBlockContent}>
        {events.slice(-5).map((e, i) => (
          <Text key={i} style={s.eventText}>{e}</Text>
        ))}
      </View>
    </View>
  );
}

/* ─── Styles ─── */

const s = StyleSheet.create({
  blockTitle: { color: '#606266', fontSize: 15, marginBottom: 10, marginTop: 10 },
  cell: {
    borderColor: '#ebeef5',
    borderWidth: StyleSheet.hairlineWidth,
    color: '#606266',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 6,
    flex: 1,
  },
  container: { backgroundColor: '#f7f8fa', flex: 1 },
  containerContent: { paddingBottom: 40, paddingHorizontal: 15, paddingTop: 15 },
  demoBlock: { marginBottom: 23 },
  demoBlockContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'column',
    padding: 12,
  },
  demoBlockContentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  demoBlockTitle: {
    color: '#909193',
    fontSize: 14,
    marginBottom: 8,
  },
  eventText: { color: '#67c23a', fontSize: 12, fontFamily: 'monospace', marginBottom: 2 },
  headerCell: {
    backgroundColor: '#f5f7fa',
    color: '#303133',
    fontWeight: '600',
  },
  paramControl: { flex: 1 },
  paramRow: { marginBottom: 0 },
  pageItem: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, padding: 15 },
  pageItemTitle: { color: '#303133', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  rowLabel: { color: '#909399', fontSize: 12, width: 80 },
  section: { marginBottom: 23 },
  sectionTitle: { color: '#909193', fontSize: 14, marginBottom: 8 },
  table: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row' },
  tableRow: { flexDirection: 'row' },
  typeCell: { color: '#e6a23c', fontFamily: 'monospace' },
  valueLabel: { color: '#909399', fontSize: 12, width: 60 },
  valueRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 4 },
  valueText: { color: '#409eff', fontSize: 13, fontWeight: '600' },
});
