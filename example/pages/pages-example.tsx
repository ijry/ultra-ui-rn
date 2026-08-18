/**
 * P47 — Ports of the uview-plus demo pages under `src/pages/example`
 * (ad / mine / template).
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UP, UPAvatar, UPButton, UPCell, UPCellGroup, UPGap, UPIcon, UPText } from 'ultra-ui-rn';
import type { DemoPageProps } from './types';

/* ------------------------------------------------------------------ */
/* example/ad — rewarded video ad (WeChat boundary)                    */
/* ------------------------------------------------------------------ */

export function AdPage(_props: DemoPageProps) {
  return (
    <View style={styles.adWrap}>
      <UPButton
        text="打开广告"
        type="primary"
        onClick={() =>
          UP.toast.default(
            '激励视频广告依赖 wx.createRewardedVideoAd（微信小程序能力），RN 中由宿主应用注入广告 SDK 后在此接入。',
          )
        }
      />
      <Text style={styles.adTip}>观看完成请点击关闭按钮</Text>
      <Text style={styles.adBoundary}>
        边界：源页调用 wx.createRewardedVideoAd / uni.request 上报观看完成；RN 版将 adUnitId 与回调留给宿主注入。
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* example/mine — profile with theme preference cells                  */
/* ------------------------------------------------------------------ */

type ThemeMode = 'system' | 'light' | 'dark';

export function MinePage(_props: DemoPageProps) {
  const [preference, setPreference] = useState<ThemeMode>('system');
  const [rootStatus, setRootStatus] = useState('UpRoot 状态：未测试');

  const themeLabel: Record<ThemeMode, string> = {
    system: '跟随系统',
    light: '浅色模式',
    dark: '深色模式',
  };

  return (
    <View>
      <View style={styles.mineCard}>
        <UPAvatar
          size={72}
          src="https://picsum.photos/seed/avatar/144/144"
        />
        <View style={styles.mineMeta}>
          <Text style={styles.mineName}>演示用户</Text>
          <Text style={styles.mineId}>ID: 1008611</Text>
        </View>
      </View>
      <UPCellGroup title="主题模式">
        {(Object.keys(themeLabel) as ThemeMode[]).map((mode) => (
          <UPCell
            clickable
            isLink
            key={mode}
            onClick={() => setPreference(mode)}
            title={themeLabel[mode]}
            value={preference === mode ? '当前' : ''}
          />
        ))}
      </UPCellGroup>
      <Text style={styles.mineStatus}>
        当前主题：{preference === 'dark' ? '深色' : '浅色'}（{themeLabel[preference]}）
      </Text>
      <UPCellGroup title="Root 根组件">
        <UPCell
          clickable
          isLink
          onClick={() => setRootStatus('UpRoot 状态：通信成功（来自 Mine 页的 UpRoot 调用）')}
          title="测试 UpRootView 通信"
        />
      </UPCellGroup>
      <Text style={styles.mineStatus}>{rootStatus}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* example/template — template page entry index                        */
/* ------------------------------------------------------------------ */

const TEMPLATE_LINKS: readonly { group: string; items: readonly { id: Parameters<DemoPageProps['open']>[0]; title: string }[] }[] = [
  {
    group: '地址',
    items: [
      { id: 'address-index', title: '收货地址' },
      { id: 'address-addSite', title: '新建地址' },
    ],
  },
  {
    group: '商城',
    items: [
      { id: 'coupon', title: '优惠券' },
      { id: 'order', title: '订单列表' },
      { id: 'submitBar', title: '提交操作栏' },
      { id: 'keyboardPay', title: '支付键盘' },
    ],
  },
  {
    group: '社交',
    items: [
      { id: 'comment-index', title: '评论列表' },
      { id: 'comment-reply', title: '评论回复' },
    ],
  },
  {
    group: '账号',
    items: [
      { id: 'login-index', title: '登录' },
      { id: 'login-code', title: '验证码登录' },
      { id: 'wxCenter', title: '个人中心' },
    ],
  },
  {
    group: '其他',
    items: [
      { id: 'citySelect', title: '城市选择' },
      { id: 'mallMenu1', title: '分类菜单 1' },
      { id: 'mallMenu2', title: '分类菜单 2' },
    ],
  },
];

export function TemplateIndexPage({ open }: DemoPageProps) {
  return (
    <View>
      <Text style={styles.templateDesc}>
        收集众多的常用页面和布局，减少开发者的重复工作，让你专注逻辑，事半功倍。
      </Text>
      {TEMPLATE_LINKS.map((group) => (
        <View key={group.group}>
          <UPGap bgColor="#f3f4f6" height={10} />
          <UPCellGroup title={group.group}>
            {group.items.map((item) => (
              <UPCell
                clickable
                isLink
                key={item.id}
                onClick={() => open(item.id)}
                title={item.title}
              />
            ))}
          </UPCellGroup>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  adBoundary: {
    color: '#909399',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 24,
  },
  adTip: {
    color: '#909399',
    fontSize: 13,
    marginVertical: 20,
    textAlign: 'center',
  },
  adWrap: {
    marginVertical: 60,
    paddingHorizontal: 20,
  },
  mineCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#ebeef5',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  mineId: {
    color: '#909399',
    fontSize: 13,
    marginTop: 6,
  },
  mineMeta: {
    marginLeft: 12,
  },
  mineName: {
    color: '#303133',
    fontSize: 18,
    fontWeight: '600',
  },
  mineStatus: {
    color: '#909399',
    fontSize: 13,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  templateDesc: {
    color: '#606266',
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
});
