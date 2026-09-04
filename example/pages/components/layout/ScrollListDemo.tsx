/**
 * ScrollList 横向滚动列表
 * 严格复刻 uview-plus pages/componentsC/scrollList/scrollList.nvue
 */
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { UPIcon, UPScrollList, toast } from 'ultra-ui-rn';
import { DemoPage, EventLog, PropsTable, Section } from '../_shared';

const PROPS = [
  { prop: 'indicator', type: 'boolean', default: 'true', desc: '是否显示滚动条' },
  { prop: 'indicatorWidth', type: 'UPDimension', default: '50', desc: '滚动条底部轨道宽度' },
  { prop: 'indicatorBarWidth', type: 'UPDimension', default: '20', desc: '滚动条滑块宽度' },
  { prop: 'indicatorColor', type: 'string', default: '#f2f2f2', desc: '滚动条轨道颜色' },
  { prop: 'indicatorActiveColor', type: 'string', default: '#3c9cff', desc: '滚动条滑块颜色' },
  { prop: 'indicatorStyle', type: 'StyleProp<ViewStyle>', default: '{}', desc: '滚动条容器自定义样式' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '组件根节点自定义样式' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '横向排列的列表内容（源默认插槽）' },
  { prop: 'onLeft', type: '() => void', default: '—', desc: '滑动到左边界时触发' },
  { prop: 'onRight', type: '() => void', default: '—', desc: '滑动到右边界时触发' },
  { prop: 'onScroll', type: '(event) => void', default: '—', desc: '滚动时触发，回调原生滚动事件' },
];

const goodsBaseUrl = 'https://uview-plus.jiangruyi.com/uview/goods/';
const menuBaseUrl = 'https://uview-plus.jiangruyi.com/uview/menu/';

const goodsArr = [
  { price: '230.5', thumbnail: '1.jpg' },
  { price: '74.1', thumbnail: '2.jpg' },
  { price: '8457', thumbnail: '6.jpg' },
  { price: '1442', thumbnail: '5.jpg' },
  { price: '541', thumbnail: '2.jpg' },
  { price: '234', thumbnail: '3.jpg' },
  { price: '562', thumbnail: '4.jpg' },
  { price: '251.5', thumbnail: '1.jpg' },
];

const menuArr = [
  [
    { name: '天猫新品', icon: '11.png' },
    { name: '今日爆款', icon: '9.png' },
    { name: '天猫国际', icon: '17.png' },
    { name: '饿了么', icon: '6.png' },
    { name: '天猫超市', icon: '11.png' },
    { name: '分类', icon: '2.png' },
    { name: '天猫美食', icon: '3.png' },
    { name: '阿里健康', icon: '12.png' },
    { name: '口碑生活', icon: '7.png' },
  ],
  [
    { name: '充值中心', icon: '8.png' },
    { name: '机票酒店', icon: '10.png' },
    { name: '金币庄园', icon: '18.png' },
    { name: '阿里拍卖', icon: '15.png' },
    { name: '淘宝吃货', icon: '16.png' },
    { name: '闲鱼', icon: '4.png' },
    { name: '会员中心', icon: '6.png' },
    { name: '造点新货', icon: '13.png' },
    { name: '土货鲜食', icon: '14.png' },
  ],
];

export default function ScrollListDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const log = (event: string) => setEvents((prev) => [...prev, event]);

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPScrollList
          indicatorActiveColor="#f56c6c"
          indicatorColor="#fff0f0"
          onLeft={() => log('left')}
          onRight={() => log('right')}
        >
          {goodsArr.map((item, index) => (
            // 源保留了 index === 9 的兜底判断，但 goodsArr 只有 8 项，永不命中。
            <View
              key={index}
              style={[s.goodsItem, index === 9 ? s.goodsItemNoMarginRight : null]}
            >
              <Image
                source={{ uri: `${goodsBaseUrl}${item.thumbnail}` }}
                style={s.goodsItemImage}
              />
              <Text style={s.goodsItemText}>￥{item.price}</Text>
            </View>
          ))}
          <Pressable onPress={() => toast.default('查看更多')} style={s.showMore}>
            {/* 源用 12px 宽 + 16px 行高把"查看更多"挤成竖排。 */}
            <Text style={s.showMoreText}>查看更多</Text>
            <UPIcon color="#f56c6c" name="arrow-leftward" size="12" />
          </Pressable>
        </UPScrollList>
      </Section>

      <Section title="多菜单扩展">
        <UPScrollList>
          <View style={s.scrollList}>
            {menuArr.map((line, index) => (
              <View key={index} style={s.line}>
                {line.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    style={[
                      s.lineItem,
                      itemIndex === line.length - 1 ? s.lineItemNoMarginRight : null,
                    ]}
                  >
                    <Image
                      source={{ uri: `${menuBaseUrl}${item.icon}` }}
                      style={s.lineItemImage}
                    />
                    <Text style={s.lineItemText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </UPScrollList>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  goodsItem: { marginRight: 20 },
  goodsItemImage: { borderRadius: 4, height: 60, width: 60 },
  goodsItemNoMarginRight: { marginRight: 0 },
  goodsItemText: { color: '#f56c6c', fontSize: 12, marginTop: 5, textAlign: 'center' },
  line: { flexDirection: 'row', marginTop: 10 },
  lineItem: { marginRight: 15 },
  lineItemImage: { height: 48, width: 61 },
  lineItemNoMarginRight: { marginRight: 0 },
  lineItemText: { color: '#606266', fontSize: 12, marginTop: 5, textAlign: 'center' },
  scrollList: { flexDirection: 'column' },
  showMore: {
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderRadius: 3,
    flexDirection: 'column',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  showMoreText: { color: '#f56c6c', fontSize: 12, lineHeight: 16, width: 12 },
});
