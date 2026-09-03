/**
 * GoodsSku 商品SKU
 * 严格复刻 uview-plus pages/componentsD/goodsSku/goodsSku.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPButton, UPGoodsSku } from 'ultra-ui-rn';
import { DemoPage, Section } from '../_shared';

export default function GoodsSkuDemo() {
  const [result, setResult] = useState('');

  const goodsInfo = {
    image: 'https://uview-plus.jiangruyi.com/uview/ext/200.jpg',
    price: 99.0,
    stock: 100,
  };

  const skuTree = [
    {
      label: '颜色',
      name: 'color',
      children: [
        { id: 1, name: '红色' },
        { id: 2, name: '蓝色' },
        { id: 3, name: '黑色' },
      ],
    },
    {
      label: '尺寸',
      name: 'size',
      children: [
        { id: 1, name: 'S' },
        { id: 2, name: 'M' },
        { id: 3, name: 'L' },
        { id: 4, name: 'XL' },
      ],
    },
  ];

  const skuList = [
    { id: 1, color: 1, size: 1, price: 99.0, stock: 50 },
    { id: 2, color: 1, size: 2, price: 99.0, stock: 40 },
    { id: 3, color: 2, size: 1, price: 109.0, stock: 30 },
    { id: 4, color: 2, size: 3, price: 109.0, stock: 20 },
    { id: 5, color: 3, size: 4, price: 89.0, stock: 60 },
  ];

  const confirmSku = (e: any) => {
    setResult(`选择了: ${e.selectedText}, 数量: ${e.num}, 价格: ${e.sku.price}`);
  };

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPGoodsSku
          confirmText="确定"
          goodsInfo={goodsInfo}
          onConfirm={confirmSku}
          renderTrigger={() => <UPButton stop={false} type="primary">打开SKU弹窗</UPButton>}
          skuList={skuList}
          skuTree={skuTree}
        />
      </Section>

      <Section title="自定义最大购买数量">
        <UPGoodsSku
          confirmText="确定"
          goodsInfo={goodsInfo}
          maxBuy={10}
          onConfirm={confirmSku}
          renderTrigger={() => <UPButton stop={false} type="error">打开SKU弹窗(最大购买10件)</UPButton>}
          skuList={skuList}
          skuTree={skuTree}
        />
      </Section>

      <Section title="自定义确认按钮文字">
        <UPGoodsSku
          confirmText="立即购买"
          goodsInfo={goodsInfo}
          onConfirm={confirmSku}
          renderTrigger={() => <UPButton stop={false} type="warning">打开SKU弹窗</UPButton>}
          skuList={skuList}
          skuTree={skuTree}
        />
      </Section>

      <Section title="无弹窗页面模式">
        <UPGoodsSku
          confirmText="立即购买"
          goodsInfo={goodsInfo}
          onConfirm={confirmSku}
          pageInline
          skuList={skuList}
          skuTree={skuTree}
        />
      </Section>

      {result ? (
        <View style={s.demoResult}>
          <Text style={s.demoResultTitle}>选择结果:</Text>
          <Text style={s.demoResultContent}>{result}</Text>
        </View>
      ) : null}
    </DemoPage>
  );
}

const s = StyleSheet.create({
  demoResult: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 15,
    padding: 10,
  },
  demoResultContent: {
    color: '#606266',
    fontSize: 13,
  },
  demoResultTitle: {
    color: '#303133',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
