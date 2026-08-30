/**
 * Component Demo Page Template
 * Each component gets its own page with examples
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

interface ComponentDemoProps {
  /** Back button handler */
  onBack?: () => void;
}

export default function ComponentNameDemo({ onBack }: ComponentDemoProps) {
  const [demoState, setDemoState] = useState<any>(null);

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
        <Text style={styles.title}>ComponentName</Text>
      </View>

      {/* Example 1: Basic Usage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基础用法</Text>
        <View style={styles.demoBox}>
          {/* Component code here */}
        </View>
      </View>

      {/* Example 2: Variants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>不同状态</Text>
        <View style={styles.demoBox}>
          {/* Variant examples */}
        </View>
      </View>

      {/* Example 3: Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>事件处理</Text>
        <View style={styles.demoBox}>
          {/* Event examples */}
        </View>
      </View>

      {/* Props Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Props</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell]}>属性</Text>
            <Text style={[styles.cell, styles.headerCell]}>类型</Text>
            <Text style={[styles.cell, styles.headerCell]}>默认值</Text>
            <Text style={[styles.cell, styles.headerCell]}>说明</Text>
          </View>
          {/* Props rows */}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    paddingRight: 12,
  },
  backText: {
    color: '#3c9cff',
    fontSize: 14,
  },
  cell: {
    borderColor: '#ebeef5',
    borderWidth: StyleSheet.hairlineWidth,
    color: '#606266',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 1,
  },
  container: {
    backgroundColor: '#f7f8fa',
    flex: 1,
  },
  demoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  header: {
    backgroundColor: '#ffffff',
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
  section: {
    marginTop: 12,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    color: '#303133',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  table: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
  },
  title: {
    color: '#303133',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
