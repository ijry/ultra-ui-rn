#!/usr/bin/env node
/**
 * Generate individual component demo pages for ultra-ui-rn
 * Mirrors uview-plus's component demo structure
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), 'example', 'pages', 'components');

// Component categories matching src/components structure
const CATEGORIES = {
  basic: {
    name: '基础组件',
    components: [
      { name: 'Button', comp: 'UPButton', desc: '按钮组件' },
      { name: 'Icon', comp: 'UPIcon', desc: '图标组件' },
      { name: 'Text', comp: 'UPText', desc: '文本组件' },
      { name: 'Tag', comp: 'UPTag', desc: '标签组件' },
      { name: 'Badge', comp: 'UPBadge', desc: '徽标组件' },
      { name: 'Link', comp: 'UPLink', desc: '链接组件' },
      { name: 'Image', comp: 'UPImage', desc: '图片组件' },
      { name: 'Avatar', comp: 'UPAvatar', desc: '头像组件' },
      { name: 'AvatarGroup', comp: 'UPAvatarGroup', desc: '头像组组件' },
    ],
  },
  form: {
    name: '表单组件',
    components: [
      { name: 'Input', comp: 'UPInput', desc: '输入框' },
      { name: 'Textarea', comp: 'UPTextarea', desc: '多行输入框' },
      { name: 'Search', comp: 'UPSearch', desc: '搜索框' },
      { name: 'Switch', comp: 'UPSwitch', desc: '开关' },
      { name: 'Checkbox', comp: 'UPCheckbox', desc: '复选框' },
      { name: 'Radio', comp: 'UPRadio', desc: '单选框' },
      { name: 'Slider', comp: 'UPSlider', desc: '滑块' },
      { name: 'Rate', comp: 'UPRate', desc: '评分' },
      { name: 'NumberBox', comp: 'UPNumberBox', desc: '数字输入' },
      { name: 'Picker', comp: 'UPPicker', desc: '选择器' },
      { name: 'DatetimePicker', comp: 'UPDatetimePicker', desc: '日期时间选择' },
      { name: 'Cascader', comp: 'UPCascader', desc: '级联选择' },
      { name: 'Form', comp: 'UPForm', desc: '表单' },
      { name: 'FormItem', comp: 'UPFormItem', desc: '表单项' },
      { name: 'CodeInput', comp: 'UPCodeInput', desc: '验证码输入' },
      { name: 'NumberKeyboard', comp: 'UPNumberKeyboard', desc: '数字键盘' },
      { name: 'CarKeyboard', comp: 'UPCarKeyboard', desc: '车牌键盘' },
      { name: 'Code', comp: 'UPCode', desc: '验证码' },
      { name: 'Choose', comp: 'UPChoose', desc: '选择器' },
    ],
  },
  navigation: {
    name: '导航组件',
    components: [
      { name: 'Navbar', comp: 'UPNavbar', desc: '导航栏' },
      { name: 'NavbarMini', comp: 'UPNavbarMini', desc: '迷你导航栏' },
      { name: 'Tabbar', comp: 'UPTabbar', desc: '标签栏' },
      { name: 'Tabs', comp: 'UPTabs', desc: '标签页' },
      { name: 'Steps', comp: 'UPSteps', desc: '步骤条' },
      { name: 'Dropdown', comp: 'UPDropdown', desc: '下拉菜单' },
      { name: 'Subsection', comp: 'UPSubsection', desc: '分段控制器' },
      { name: 'Pagination', comp: 'UPPagination', desc: '分页' },
      { name: 'Toolbar', comp: 'UPToolbar', desc: '工具栏' },
    ],
  },
  display: {
    name: '展示组件',
    components: [
      { name: 'Card', comp: 'UPCard', desc: '卡片' },
      { name: 'Cell', comp: 'UPCell', desc: '单元格' },
      { name: 'CellGroup', comp: 'UPCellGroup', desc: '单元格组' },
      { name: 'Collapse', comp: 'UPCollapse', desc: '折叠面板' },
      { name: 'LineProgress', comp: 'UPLineProgress', desc: '线性进度条' },
      { name: 'CircleProgress', comp: 'UPCircleProgress', desc: '环形进度条' },
      { name: 'CountDown', comp: 'UPCountDown', desc: '倒计时' },
      { name: 'CountTo', comp: 'UPCountTo', desc: '数字滚动' },
      { name: 'Skeleton', comp: 'UPSkeleton', desc: '骨架屏' },
      { name: 'Empty', comp: 'UPEmpty', desc: '空状态' },
      { name: 'Divider', comp: 'UPDivider', desc: '分割线' },
      { name: 'Section', comp: 'UPSection', desc: '内容区' },
      { name: 'Title', comp: 'UPTitle', desc: '标题' },
      { name: 'Alert', comp: 'UPAlert', desc: '警告提示' },
    ],
  },
  feedback: {
    name: '反馈组件',
    components: [
      { name: 'Toast', comp: 'UPToast', desc: '轻提示' },
      { name: 'Notify', comp: 'UPNotify', desc: '通知' },
      { name: 'Popup', comp: 'UPPopup', desc: '弹出层' },
      { name: 'Modal', comp: 'UPModal', desc: '模态框' },
      { name: 'ActionSheet', comp: 'UPActionSheet', desc: '操作面板' },
      { name: 'LoadingPage', comp: 'UPLoadingPage', desc: '加载页' },
      { name: 'Guide', comp: 'UPGuide', desc: '引导' },
      { name: 'Tooltip', comp: 'UPTooltip', desc: '文字提示' },
      { name: 'Popover', comp: 'UPPopover', desc: '气泡弹出' },
      { name: 'SwipeAction', comp: 'UPSwipeAction', desc: '滑动操作' },
    ],
  },
  advanced: {
    name: '高级组件',
    components: [
      { name: 'Upload', comp: 'UPUpload', desc: '上传' },
      { name: 'Album', comp: 'UPAlbum', desc: '相册' },
      { name: 'Swiper', comp: 'UPSwiper', desc: '轮播' },
      { name: 'Table', comp: 'UPTable', desc: '表格' },
      { name: 'IndexList', comp: 'UPIndexList', desc: '索引列表' },
      { name: 'Waterfall', comp: 'UPWaterfall', desc: '瀑布流' },
      { name: 'Tree', comp: 'UPTree', desc: '树形控件' },
      { name: 'Dragsort', comp: 'UPDragsort', desc: '拖拽排序' },
      { name: 'Signature', comp: 'UPSignature', desc: '签名' },
      { name: 'VirtualList', comp: 'UPVirtualList', desc: '虚拟列表' },
      { name: 'PullRefresh', comp: 'UPPullRefresh', desc: '下拉刷新' },
      { name: 'LazyLoad', comp: 'UPLazyLoad', desc: '懒加载' },
      { name: 'Canvas', comp: 'UPCanvas', desc: '画布' },
      { name: 'Qrcode', comp: 'UPQrcode', desc: '二维码' },
      { name: 'Barcode', comp: 'UPBarcode', desc: '条形码' },
      { name: 'Coupon', comp: 'UPCoupon', desc: '优惠券' },
      { name: 'ColorPicker', comp: 'UPColorPicker', desc: '颜色选择' },
      { name: 'GoodsSku', comp: 'UPGoodsSku', desc: '商品SKU' },
      { name: 'Markdown', comp: 'UPMarkdown', desc: 'Markdown' },
      { name: 'Parse', comp: 'UPParse', desc: '富文本解析' },
      { name: 'NovelReader', comp: 'UPNovelReader', desc: '小说阅读' },
    ],
  },
  layout: {
    name: '布局组件',
    components: [
      { name: 'Row', comp: 'UPRow', desc: '行布局' },
      { name: 'Col', comp: 'UPCol', desc: '列布局' },
      { name: 'Grid', comp: 'UPGrid', desc: '网格' },
      { name: 'GridItem', comp: 'UPGridItem', desc: '网格项' },
      { name: 'View', comp: 'UPView', desc: '视图容器' },
      { name: 'Box', comp: 'UPBox', desc: '盒容器' },
      { name: 'Gap', comp: 'UPGap', desc: '间距' },
      { name: 'Line', comp: 'UPLine', desc: '线条' },
      { name: 'ScrollHost', comp: 'UPScrollHost', desc: '滚动容器' },
      { name: 'Sticky', comp: 'UPSticky', desc: '吸顶' },
      { name: 'SafeBottom', comp: 'UPSafeBottom', desc: '安全区域' },
      { name: 'BackTop', comp: 'UPBackTop', desc: '返回顶部' },
      { name: 'List', comp: 'UPList', desc: '列表' },
    ],
  },
};

// Generate a component page
function generateComponentPage(category, comp) {
  return `/**
 * ${comp.comp} 组件示例
 * ${comp.desc}
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ${comp.comp} } from 'ultra-ui-rn';

interface Props {
  onBack?: () => void;
}

export default function ${comp.name}Demo({ onBack }: Props) {
  const [value, setValue] = useState<any>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
        <Text style={styles.title}>${comp.name} ${comp.desc}</Text>
      </View>

      {/* 基础用法 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基础用法</Text>
        <View style={styles.demoBox}>
          <${comp.comp} />
        </View>
      </View>

      {/* Props 表格 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Props</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell]}>属性</Text>
            <Text style={[styles.cell, styles.headerCell]}>类型</Text>
            <Text style={[styles.cell, styles.headerCell]}>默认值</Text>
            <Text style={[styles.cell, styles.headerCell]}>说明</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>参见文档</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  section: { marginTop: 12, paddingHorizontal: 12 },
  sectionTitle: { color: '#303133', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  table: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row' },
  tableRow: { flexDirection: 'row' },
  title: { color: '#303133', fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
});
`;
}

// Generate index for category
function generateCategoryIndex(category, components) {
  const imports = components.map(c => 
    `export { default as ${c.name}Demo } from './${c.name}Demo';`
  ).join('\n');
  
  const list = components.map(c => `'${c.name}'`).join(', ');
  
  return `/**
 * ${CATEGORIES[category].name}组件列表
 */
${imports}

export const ${category.toUpperCase()}_COMPONENTS = [${list}] as const;
`;
}

// Main
console.log('Generating component demo pages...');

let total = 0;
for (const [cat, info] of Object.entries(CATEGORIES)) {
  const dir = join(ROOT, cat);
  mkdirSync(dir, { recursive: true });
  
  for (const comp of info.components) {
    const content = generateComponentPage(cat, comp);
    writeFileSync(join(dir, `${comp.name}Demo.tsx`), content);
    total++;
  }
  
  const index = generateCategoryIndex(cat, info.components);
  writeFileSync(join(dir, 'index.ts'), index);
  
  console.log(`  ${info.name}: ${info.components.length} components`);
}

console.log(`\nGenerated ${total} component pages across ${Object.keys(CATEGORIES).length} categories`);
