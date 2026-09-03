/**
 * Coupon 优惠券
 * 严格复刻 uview-plus pages/componentsD/coupon/coupon.nvue
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { UPButton, UPCoupon } from 'ultra-ui-rn';
import { DemoPage, PageItem } from '../_shared';

export default function CouponDemo() {
  return (
    <DemoPage>
      <PageItem title="基础优惠券">
        <UPCoupon
          amount={100}
          color="#333"
          limit="满200可用"
          time="2023-12-31前使用"
          title="满减券"
        />
      </PageItem>

      <PageItem title="小尺寸">
        <UPCoupon
          actionText="去使用"
          amount={20}
          size="small"
          title="满减券"
        />
      </PageItem>

      <PageItem title="大尺寸">
        <UPCoupon
          amount={200}
          desc="仅限VIP用户"
          limit="满500可用"
          size="large"
          time="有效期至2023-12-31"
          title="大额优惠券"
          type="error"
          unit="￥"
        />
      </PageItem>

      <PageItem title="自定义内容">
        <UPCoupon
          amount={66}
          desc="通过插槽自定义内容"
          shape="card"
          title="自定义样式"
          amountNode={(amount) => (
            <Text style={s.customAmount}>{amount}</Text>
          )}
          titleNode={(title) => (
            <Text style={s.customTitle}>{title}</Text>
          )}
          actionNode={
            <UPButton
              customStyle={{ borderRadius: 6 }}
              hairline={false}
              size="mini"
              type="success"
            >
              立即使用
            </UPButton>
          }
        />
      </PageItem>

      <PageItem title="圆形按钮">
        <UPCoupon
          actionText="抢购"
          amount={30}
          circle
          desc="今日专享"
          title="限时优惠"
        />
      </PageItem>

      <PageItem title="禁用状态">
        <UPCoupon
          amount={50}
          desc="活动已结束"
          disabled
          time="2023-01-01至2023-01-31"
          title="已过期"
        />
      </PageItem>

      <PageItem title="红包样式">
        <UPCoupon
          amount={50}
          desc="限时专享"
          shape="envelope"
          title="新人红包"
          type="warning"
          unit="元"
        />
      </PageItem>

      <PageItem title="卡片样式">
        <UPCoupon
          actionText="立即领取"
          amount={88}
          desc="全场通用"
          shape="card"
          title="折扣券"
          type="success"
          unit="折"
        />
      </PageItem>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  customAmount: { color: '#ff0000', fontSize: 30, fontWeight: 'bold' },
  customTitle: { color: '#333', fontSize: 18, fontWeight: 'bold' },
});
