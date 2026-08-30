/**
 * 组件示例页 - 导航组件
 * 导航栏、标签栏、标签页、下拉菜单、步骤条、分段控制器
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  UPNavbar,
  UPNavbarMini,
  UPTabbar,
  UPTabbarItem,
  UPTabs,
  UPDropdown,
  UPDropdownItem,
  UPSteps,
  UPStepsItem,
  UPSubsection,
  UPPagination,
  UPToolbar,
  UPButton,
} from 'ultra-ui-rn';

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState<string | number>('home');
  const [tabIndex, setTabIndex] = useState(0);
  const [subsectionIndex, setSubsectionIndex] = useState(0);
  const [navigationEvent, setNavigationEvent] = useState('none');
  const [delivery, setDelivery] = useState<string | number>('standard');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>导航组件</Text>

      {/* 导航栏 Navbar */}
      <Text style={styles.section}>导航栏 Navbar</Text>
      <UPNavbar
        border
        leftText="返回"
        onLeftClick={() => setNavigationEvent('navbar:left')}
        onRightClick={() => setNavigationEvent('navbar:right')}
        rightText="帮助"
        title="导航栏"
      />

      {/* 迷你导航栏 NavbarMini */}
      <Text style={styles.section}>迷你导航栏 NavbarMini</Text>
      <UPNavbarMini
        autoBack={false}
        fixed={false}
        homeUrl="/pages/index/index"
        onHomeClick={({ homeUrl }) => setNavigationEvent(`navbar-mini:home:${homeUrl}`)}
        onLeftClick={() => setNavigationEvent('navbar-mini:left')}
      />
      <Text>导航事件: {navigationEvent}</Text>

      {/* 标签栏 Tabbar */}
      <Text style={styles.section}>标签栏 Tabbar</Text>
      <UPTabbar fixed={false} onChange={setActiveTab} value={activeTab}>
        <UPTabbarItem activeIcon="home-fill" icon="home" name="home" text="首页" />
        <UPTabbarItem badge={2} icon="star" name="favorites" text="收藏" />
        <UPTabbarItem activeIcon="grid-fill" icon="grid" name="pages" text="页面" />
      </UPTabbar>
      <Text>当前标签: {activeTab}</Text>

      {/* 标签页 Tabs */}
      <Text style={styles.section}>标签页 Tabs</Text>
      <UPTabs
        current={tabIndex}
        list={[{ name: '新闻' }, { name: '收藏' }, { disabled: true, name: '锁定' }]}
        onUpdateCurrent={setTabIndex}
      />
      <Text>选中标签: {['新闻', '收藏', '锁定'][tabIndex]}</Text>

      {/* 分段控制器 Subsection */}
      <Text style={styles.section}>分段控制器 Subsection</Text>
      <UPSubsection
        current={subsectionIndex}
        list={['每天', '每周', '每月']}
        onUpdateCurrent={setSubsectionIndex}
      />
      <Text>选中范围: {['每天', '每周', '每月'][subsectionIndex]}</Text>

      {/* 下拉菜单 Dropdown */}
      <Text style={styles.section}>下拉菜单 Dropdown</Text>
      <UPDropdown>
        <UPDropdownItem
          modelValue={delivery}
          onUpdateModelValue={(value) => {
            if (typeof value === 'string' || typeof value === 'number') setDelivery(value);
          }}
          options={[
            { label: '标准配送', value: 'standard' },
            { label: '快递配送', value: 'express' },
          ]}
          title="配送方式"
        />
      </UPDropdown>
      <Text>配送: {delivery}</Text>

      {/* 步骤条 Steps */}
      <Text style={styles.section}>步骤条 Steps</Text>
      <UPSteps current={1}>
        <UPStepsItem desc="10:00" title="已打包" />
        <UPStepsItem desc="10:30" title="已发货" />
        <UPStepsItem title="已送达" />
      </UPSteps>

      {/* 工具栏 Toolbar */}
      <Text style={styles.section}>工具栏 Toolbar</Text>
      <UPToolbar
        onCancel={() => console.log('取消')}
        onConfirm={() => console.log('确认')}
        title="筛选"
      />

      {/* 分页 Pagination */}
      <Text style={styles.section}>分页 Pagination</Text>
      <UPPagination
        currentPage={page}
        layout="prev, pager, total, sizes, next"
        onCurrentChange={setPage}
        onSizeChange={setPageSize}
        pageSize={pageSize}
        total={95}
      />
      <Text>当前页: {page}, 每页: {pageSize}</Text>
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
  section: {
    color: '#606266',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    color: '#303133',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
