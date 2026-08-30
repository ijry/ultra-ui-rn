/**
 * 组件示例页 - 布局组件
 * 行、列、网格、滚动容器、吸顶、安全区域、返回顶部
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  UP,
  UPRow,
  UPCol,
  UPGrid,
  UPGridItem,
  UPScrollHost,
  UPSticky,
  UPSafeBottom,
  UPBackTop,
  UPList,
  UPListItem,
  UPScrollList,
  UPTag,
  UPText,
  UPButton,
  UPCell,
} from 'ultra-ui-rn';

export default function LayoutPage() {
  const [selectedIndex, setSelectedIndex] = useState('A');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>布局组件</Text>

      {/* 行 Row */}
      <Text style={styles.section}>行 Row</Text>
      <UPRow gutter="12px">
        <UPCol span={6}>
          <UPTag text="半列" type="primary" />
        </UPCol>
        <UPCol span={6}>
          <UPTag plain text="半列" type="success" />
        </UPCol>
      </UPRow>

      {/* 网格 Grid */}
      <Text style={styles.section}>网格 Grid</Text>
      <UPGrid border col={3} gap="4px">
        <UPGridItem name="one">
          <UPText align="center" text="一" />
        </UPGridItem>
        <UPGridItem name="two">
          <UPText align="center" text="二" />
        </UPGridItem>
        <UPGridItem name="three">
          <UPText align="center" text="三" />
        </UPGridItem>
      </UPGrid>

      {/* 滚动容器 ScrollHost */}
      <Text style={styles.section}>滚动容器 ScrollHost</Text>
      <UPScrollHost
        contentContainerStyle={styles.scrollContent}
        overlay={<UPBackTop top={100} />}
        style={styles.scrollHost}
      >
        <UPText text="这是一个可滚动的容器，内容超出时显示返回顶部按钮。" />
        <View style={{ height: 400, backgroundColor: '#f5f5f5', marginTop: 16 }}>
          <UPText text="长内容区域" />
        </View>
      </UPScrollHost>

      {/* 吸顶 Sticky */}
      <Text style={styles.section}>吸顶 Sticky</Text>
      <UPSticky>
        <View style={styles.stickyBar}>
          <UPText text="吸顶导航栏" />
        </View>
      </UPSticky>

      {/* 列表 List */}
      <Text style={styles.section}>列表 List</Text>
      <UPList
        height={160}
        lowerThreshold={20}
        onScrollToLower={() => UP.toast.default('到达列表底部')}
      >
        <UPListItem anchor="profile">
          <UPCell title="个人信息" />
        </UPListItem>
        <UPListItem anchor="settings">
          <UPCell title="设置" />
        </UPListItem>
        <UPListItem anchor="security">
          <UPCell title="安全" />
        </UPListItem>
      </UPList>

      {/* 横向滚动列表 ScrollList */}
      <Text style={styles.section}>横向滚动列表 ScrollList</Text>
      <UPScrollList>
        <View style={styles.scrollCard}>
          <UPText text="热门" />
        </View>
        <View style={styles.scrollCard}>
          <UPText text="关注" />
        </View>
        <View style={styles.scrollCard}>
          <UPText text="推荐" />
        </View>
      </UPScrollList>

      {/* 安全区域 SafeBottom */}
      <Text style={styles.section}>安全区域 SafeBottom</Text>
      <UPSafeBottom />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  scrollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginRight: 8,
    padding: 16,
    width: 130,
  },
  scrollContent: {
    backgroundColor: '#f7f8fa',
    padding: 16,
  },
  scrollHost: {
    height: 200,
  },
  section: {
    color: '#606266',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  stickyBar: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  title: {
    color: '#303133',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
