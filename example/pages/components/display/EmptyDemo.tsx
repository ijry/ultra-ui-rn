/**
 * Empty 内容为空
 * 严格复刻 uview-plus pages/componentsA/empty/empty.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UPButton, UPCell, UPEmpty } from 'ultra-ui-rn';
import { DemoPage, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'icon', type: 'string', default: '—', desc: '自定义图标名或图片地址' },
  { prop: 'text', type: 'string', default: '—', desc: '提示文字' },
  { prop: 'mode', type: 'string', default: "'data'", desc: '内置图标类型（car/data/order 等）' },
  { prop: 'iconSize', type: 'number | string', default: '90', desc: '图标大小' },
  { prop: 'iconColor', type: 'string', default: '#c0c4cc', desc: '图标颜色' },
  { prop: 'textSize', type: 'number | string', default: '14', desc: '文字大小' },
  { prop: 'textColor', type: 'string', default: '#c0c4cc', desc: '文字颜色' },
  { prop: 'marginTop', type: 'number | string', default: '0', desc: '与上一个元素的距离' },
  { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示组件' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '图标下方的自定义内容（源默认插槽）' },
];

// 源注释：勿直接引用 uview-plus.jiangruyi.com 的资源，路径随时可能变动。
const baseUrl = 'https://uview-plus.jiangruyi.com/uview/empty/';

const imgList: Record<string, string> = {
  address: `${baseUrl}address.png`,
  car: `${baseUrl}car.png`,
  comment: `${baseUrl}comment.png`,
  coupon: `${baseUrl}coupon.png`,
  data: `${baseUrl}data.png`,
  history: `${baseUrl}history.png`,
  list: `${baseUrl}list.png`,
  message: `${baseUrl}message.png`,
  news: `${baseUrl}news.png`,
  order: `${baseUrl}order.png`,
  page: `${baseUrl}page.png`,
  permission: `${baseUrl}permission.png`,
  search: `${baseUrl}search.png`,
  wifi: `${baseUrl}wifi.png`,
};

const demoBase = 'https://uview-plus.jiangruyi.com/uview/demo/empty/';

const list = [
  { imgName: 'car', title: '购物车为空(同时传入slot)', iconUrl: `${demoBase}car.png` },
  { imgName: 'data', title: '数据为空', iconUrl: `${demoBase}data.png` },
  { imgName: 'comment', title: '评论为空', iconUrl: `${demoBase}comment.png` },
  { imgName: 'coupon', title: '没有优惠券', iconUrl: `${demoBase}coupon.png` },
  { imgName: 'history', title: '无历史记录', iconUrl: `${demoBase}history.png` },
  { imgName: 'list', title: '列表为空', iconUrl: `${demoBase}list.png` },
  { imgName: 'message', title: '消息列表为空', iconUrl: `${demoBase}message.png` },
  { imgName: 'news', title: '无新闻列表', iconUrl: `${demoBase}news.png` },
  { imgName: 'order', title: '订单为空', iconUrl: `${demoBase}order.png` },
  { imgName: 'page', title: '页面不存在', iconUrl: `${demoBase}page.png` },
  { imgName: 'permission', title: '无权限', iconUrl: `${demoBase}permission.png` },
  { imgName: 'search', title: '没有搜索结果', iconUrl: `${demoBase}search.png` },
  { imgName: 'wifi', title: '没有WiFi', iconUrl: `${demoBase}wifi.png` },
];

export default function EmptyDemo() {
  const [mode, setMode] = useState('car');

  return (
    <DemoPage>
      <View style={s.topBox}>
        <Text style={s.blockTitle}>演示效果</Text>
      </View>

      <UPEmpty icon={imgList[mode]} mode={mode}>
        {mode === 'car' ? (
          <UPButton customStyle={s.moreButton} size="small" text="查看更多商品" type="primary" />
        ) : null}
      </UPEmpty>

      <View style={s.emptySelect}>
        {list.map((item) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.imgName}
            onClick={() => setMode(item.imgName)}
            title={item.title}
            titleStyle={s.cellTitle}
          />
        ))}
      </View>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  blockTitle: { color: '#909193', fontSize: 14, marginBottom: 8 },
  cellIcon: { height: 30, marginRight: 8, width: 30 },
  cellTitle: { fontWeight: '500' },
  emptySelect: { marginTop: 10 },
  moreButton: { marginTop: 10 },
  topBox: { paddingLeft: 20 },
});
