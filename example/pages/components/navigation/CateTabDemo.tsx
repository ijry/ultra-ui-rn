/**
 * CateTab 分类选项卡
 * 严格复刻 uview-plus pages/componentsD/cateTab/cateTab.vue
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  UPCateTab,
  UPCell,
  UPCellGroup,
  UPImage,
  UPNumberBox,
  type UPCateTabItem,
} from 'ultra-ui-rn';
import { PropsTable } from '../_shared';

const PROPS = [
  { prop: 'mode', type: "'follow' | 'tab'", default: "'follow'", desc: 'follow 右侧滚动联动左侧菜单，tab 只显示当前分类' },
  { prop: 'height', type: 'UPDimension', default: "'100%'", desc: '组件高度，支持数字/px/百分比' },
  { prop: 'tabList', type: 'readonly UPCateTabItem[]', default: '[]', desc: '分类数据，子项放在 children 中' },
  { prop: 'tabKeyName', type: 'string', default: "'name'", desc: '分类标题取值字段名' },
  { prop: 'itemKeyName', type: 'string', default: "'name'", desc: '子项标题取值字段名' },
  { prop: 'current', type: 'number', default: '0', desc: '当前选中分类下标（受控）' },
  { prop: 'defaultCurrent', type: 'number', default: '—', desc: '初始选中分类下标（非受控）' },
  { prop: 'animated', type: 'boolean', default: 'true', desc: '菜单与右侧滚动是否使用动画' },
  { prop: 'renderTabItem', type: '(payload) => ReactNode', default: '—', desc: '自定义左侧菜单项（源 tabItem 插槽）' },
  { prop: 'renderRightTop', type: '(payload) => ReactNode', default: '—', desc: '自定义右侧顶部内容（源 rightTop 插槽）' },
  { prop: 'renderItemList', type: '(payload) => ReactNode', default: '—', desc: '自定义整段分类内容（源 itemList 插槽）' },
  { prop: 'renderPageItem', type: '(payload) => ReactNode', default: '—', desc: '自定义单个子项（源 pageItem 插槽）' },
  { prop: 'menuStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '左侧菜单容器样式' },
  { prop: 'menuItemStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '左侧菜单项样式' },
  { prop: 'activeMenuItemStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '左侧选中菜单项样式' },
  { prop: 'rightStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '右侧滚动容器样式' },
  { prop: 'sectionStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '右侧每段分类容器样式' },
  { prop: 'titleStyle', type: 'StyleProp<TextStyle>', default: '—', desc: '右侧分类标题样式' },
  { prop: 'itemTextStyle', type: 'StyleProp<TextStyle>', default: '—', desc: '子项默认文字样式' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '组件根节点自定义样式' },
  { prop: 'onUpdateCurrent', type: '(index: number) => void', default: '—', desc: '选中分类变化时触发（源 update:current）' },
  { prop: 'onChange', type: '(index, item) => void', default: '—', desc: '选中分类变化时触发，带分类数据' },
];

const COVER = 'https://uview-plus.jiangruyi.com/uview/ext/59c256f85a8c3757.jpg';

const TAB_LIST: readonly UPCateTabItem[] = [
  { title: '选项一', children: [{ title: '水煮肉片', cover: COVER, price: 88 }] },
  { title: '选项二', children: [{ title: '酸菜鱼', cover: COVER, price: 99 }] },
  { title: '选项三', children: [{ title: '水煮肉片', cover: COVER, price: 88 }] },
  { title: '选项四', children: [{ title: '酸菜鱼', cover: COVER, price: 99 }] },
];

export default function CateTabDemo() {
  // 源在 setTimeout 1s 后才把 tabList 灌进组件，用来验证异步数据。
  const [tabList, setTabList] = useState<readonly UPCateTabItem[]>([]);
  const { height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => setTabList(TAB_LIST), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.page}>
      {/* 源为 linear-gradient(135deg,#fce38a,#f38181)，RN 无原生渐变，取首个色标。 */}
      <View style={s.banner} />
      {/* 源 height 是 calc(100vh - 150px)，本地 height 只吃数字/px/%，这里按窗口高度算差值。 */}
      <UPCateTab
        height={height - 150}
        itemKeyName="title"
        mode="follow"
        renderPageItem={({ item }) => (
          // 源 pageItem 插槽内容宽度 100%；本地 UPCateTab 把每个子项塞进固定
          // 33.3333% 宽的九宫格单元（UPCateTab.tsx thumbBox），无法撑满整行。
          <View style={s.pageItem}>
            <UPCellGroup border={false}>
              <UPCell
                border={false}
                iconNode={<UPImage height="60px" src={String(item.cover ?? '')} width="80px" />}
                labelNode={
                  <View>
                    <View style={s.priceRow}>
                      <Text style={s.textRed}>￥{String(item.price ?? '')}</Text>
                    </View>
                    <View style={s.numberBoxRow}>
                      <UPNumberBox buttonSize="22px" />
                    </View>
                  </View>
                }
                titleNode={<Text style={s.title}>{String(item.title ?? '')}</Text>}
                valueNode={<View />}
              />
            </UPCellGroup>
          </View>
        )}
        tabKeyName="title"
        tabList={tabList}
      />

      <View style={s.propsWrap}>
        <PropsTable rows={PROPS} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: { backgroundColor: '#fce38a', height: 68, marginBottom: 10 },
  numberBoxRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end' },
  page: { flex: 1, padding: 0 },
  pageItem: { width: '100%' },
  priceRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    paddingTop: 4,
  },
  propsWrap: { paddingHorizontal: 15, paddingTop: 15 },
  textRed: { color: 'red', fontSize: 15 },
  title: { color: '#303133', fontSize: 15, lineHeight: 22 },
});
