/**
 * Shared styles and helpers for all component demo pages.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

export interface DemoProps {
  onBack?: () => void;
}

/* ─── Layout ─── */

export function DemoPage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>← 返回</Text>
        </Pressable>
        <Text style={s.title}>{title}</Text>
      </View>
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
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.demoBox}>{children}</View>
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
      <View style={s.demoBox}>
        {events.slice(-5).map((e, i) => (
          <Text key={i} style={s.eventText}>{e}</Text>
        ))}
      </View>
    </View>
  );
}

/* ─── Styles ─── */

const s = StyleSheet.create({
  backBtn: { paddingRight: 12 },
  backText: { color: '#3c9cff', fontSize: 14 },
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
  demoBox: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  eventText: { color: '#67c23a', fontSize: 12, fontFamily: 'monospace', marginBottom: 2 },
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
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
  title: { color: '#303133', fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  typeCell: { color: '#e6a23c', fontFamily: 'monospace' },
  valueLabel: { color: '#909399', fontSize: 12, width: 60 },
  valueRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 4 },
  valueText: { color: '#409eff', fontSize: 13, fontWeight: '600' },
});
