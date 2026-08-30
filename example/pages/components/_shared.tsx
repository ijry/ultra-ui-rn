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

/* ─── Layout ─── */

export function DemoPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollView style={s.container}>
      {children}
    </ScrollView>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.demoBlock}>
      <Text style={s.demoBlockTitle}>{title}</Text>
      <View style={s.demoBlockContent}>{children}</View>
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
  demoBlock: { marginBottom: 16, paddingHorizontal: 12 },
  demoBlockContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  demoBlockTitle: {
    color: '#303133',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventText: { color: '#67c23a', fontSize: 12, fontFamily: 'monospace', marginBottom: 2 },
  headerCell: {
    backgroundColor: '#f5f7fa',
    color: '#303133',
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  rowLabel: { color: '#909399', fontSize: 12, width: 80 },
  section: { marginTop: 12, paddingHorizontal: 12 },
  sectionTitle: { color: '#303133', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  table: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row' },
  tableRow: { flexDirection: 'row' },
  typeCell: { color: '#e6a23c', fontFamily: 'monospace' },
  valueLabel: { color: '#909399', fontSize: 12, width: 60 },
  valueRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 4 },
  valueText: { color: '#409eff', fontSize: 13, fontWeight: '600' },
});
