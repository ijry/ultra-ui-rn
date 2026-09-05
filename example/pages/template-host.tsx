/**
 * TemplatePagesHost — 「模板」tab
 *
 * 分组、顺序、标签照抄上游 `pages/example/template.config.js`：2 个分组、11 条入口。
 * 上游同样不在索引里列 CommentReply / LoginCode / AddressAddSite —— 它们是从对应
 * 页面内部跳进去的子页，这里保持一致。
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UPCell, UPCellGroup, UPGap, UPIcon } from 'ultra-ui-rn';
import type { DemoPageProps } from './types';
import {
  AddressAddSitePage,
  AddressIndexPage,
  CitySelectPage,
  CommentIndexPage,
  CommentReplyPage,
  CouponPage,
  KeyboardPayPage,
  LoginCodePage,
  LoginIndexPage,
  MallMenu1Page,
  MallMenu2Page,
  OrderPage,
  SubmitBarPage,
  WxCenterPage,
} from './pages-template';

type TemplatePage = React.ComponentType<DemoPageProps>;

interface TemplateEntry {
  id: string;
  page: TemplatePage;
  /**
   * 上游从页面内部 `uni.navigateTo` 进去的子页，索引里不单独列。
   * 三条：收货地址 → 新增地址、评论列表 → 回复、登录 → 验证码。
   */
  sub?: { page: TemplatePage; title: string };
  title: string;
}

const GROUPS: readonly { groupName: string; items: readonly TemplateEntry[] }[] = [
  {
    groupName: '部件',
    items: [{ id: 'coupon', page: CouponPage, title: 'Coupon 优惠券' }],
  },
  {
    groupName: '页面',
    items: [
      { id: 'wxCenter', page: WxCenterPage, title: 'WxCenter 仿微信个人中心' },
      { id: 'keyboardPay', page: KeyboardPayPage, title: 'KeyboardPay 自定义键盘支付模板' },
      { id: 'mallMenu1', page: MallMenu1Page, title: 'MallMenu 垂直分类(左右独立)' },
      { id: 'mallMenu2', page: MallMenu2Page, title: 'MallMenu 垂直分类(左右联动)' },
      { id: 'submitBar', page: SubmitBarPage, title: 'SubmitBar 提交订单栏' },
      {
        id: 'comment',
        page: CommentIndexPage,
        sub: { page: CommentReplyPage, title: 'Comment 评论回复' },
        title: 'Comment 评论列表',
      },
      { id: 'order', page: OrderPage, title: 'Order 订单列表' },
      {
        id: 'login',
        page: LoginIndexPage,
        sub: { page: LoginCodePage, title: 'Login 验证码' },
        title: 'Login 登录界面',
      },
      {
        id: 'address',
        page: AddressIndexPage,
        sub: { page: AddressAddSitePage, title: 'Address 新增地址' },
        title: 'Address 收货地址',
      },
      { id: 'citySelect', page: CitySelectPage, title: 'CitySelect 城市选择' },
    ],
  },
];

/** 上游 template.vue 里 page-nav 的 desc 原文 */
const DESC = '收集众多的常用页面和布局，减少开发者的重复工作，让你专注逻辑，事半功倍。';

export function TemplatePagesHost() {
  const [open, setOpen] = useState<TemplateEntry | null>(null);
  const [inSub, setInSub] = useState(false);

  if (open) {
    const Page = inSub && open.sub ? open.sub.page : open.page;
    const title = inSub && open.sub ? open.sub.title : open.title;
    return (
      <View style={s.fill}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => {
              if (inSub) setInSub(false);
              else setOpen(null);
            }}
            style={s.backBtn}
          >
            <UPIcon color="#3c9cff" customPrefix="uicon" name="arrow-left" size={16} />
          </Pressable>
          <Text numberOfLines={1} style={s.topTitle}>
            {title}
          </Text>
        </View>
        <ScrollView contentContainerStyle={s.body} style={s.fill}>
          <Page onBack={() => setOpen(null)} onOpenSub={open.sub ? () => setInSub(true) : undefined} />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.page} style={s.fill}>
      <View style={s.nav}>
        <Text style={s.navTitle}>模板</Text>
        <Text style={s.navDesc}>{DESC}</Text>
      </View>
      {GROUPS.map((group) => (
        <View key={group.groupName}>
          <UPGap bgColor="#f3f4f6" height={10} />
          <UPCellGroup title={group.groupName} titleBgColor="rgb(243, 244, 246)">
            {group.items.map((item) => (
              <UPCell
                  isLink
                  key={item.id}
                  onClick={() => {
                    setInSub(false);
                    setOpen(item);
                  }}
                  title={item.title}
                />
            ))}
          </UPCellGroup>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  backBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  body: { backgroundColor: '#f7f8fa', paddingBottom: 56 },
  fill: { flex: 1 },
  nav: { backgroundColor: '#ffffff', paddingBottom: 16, paddingHorizontal: 16, paddingTop: 12 },
  navDesc: { color: '#909399', fontSize: 13, lineHeight: 20 },
  navTitle: { color: '#303133', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  page: { backgroundColor: '#f5f7fa', paddingBottom: 48 },
  topBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  topTitle: { color: '#303133', flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
