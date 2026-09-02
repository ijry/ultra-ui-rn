/**
 * Grid 宫格布局
 * 严格复刻 uview-plus pages/componentsA/grid/grid.nvue
 */
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPGrid, UPGridItem, UPIcon, UPToast, type UPToastRef } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'col', type: 'number | string', default: '3', desc: '每行显示的宫格数量' },
  { prop: 'border', type: 'boolean', default: 'true', desc: '是否显示宫格边框' },
  { prop: 'align', type: "'left' | 'center' | 'right'", default: "'center'", desc: '宫格对齐方式' },
  { prop: 'gap', type: 'number | string', default: '0', desc: '宫格之间的间距' },
  { prop: 'name', type: 'string | number', default: '—', desc: '宫格标识符（GridItem）' },
  { prop: 'onClick', type: '(name) => void', default: '—', desc: '点击宫格时触发' },
];

const baseList = [
  { name: 'photo', title: '图片' },
  { name: 'lock', title: '锁头' },
  { name: 'star', title: '星星' },
  { name: 'hourglass', title: '沙漏' },
  { name: 'home', title: '首页' },
  { name: 'volume', title: '音量' },
];

const list = baseList;

export default function GridDemo() {
  const toast = useRef<UPToastRef>(null);

  const click = (name: string | number) => {
    toast.current?.show({ message: `点击了第${String(name)}个`, type: 'success' });
  };

  return (
    <DemoPage>
      <Section contentStyle={s.flush} title="基本案例">
        <UPGrid align="center" border={false} onClick={click}>
          {baseList.map((item) => (
            <UPGridItem key={item.title} name={item.title} onClick={() => click('test')}>
              <UPIcon customStyle={s.iconTop} name={item.name} size={22} />
              <Text style={s.gridText}>{item.title}</Text>
            </UPGridItem>
          ))}
        </UPGrid>
      </Section>

      <Section contentStyle={s.flush} title="显示边框">
        <UPGrid border>
          {list.map((item) => (
            <UPGridItem customStyle={s.itemPadding} key={item.title} name={item.title}>
              <UPIcon customStyle={s.iconTop} name={item.name} size={22} />
              <Text style={s.gridText}>{item.title}</Text>
            </UPGridItem>
          ))}
        </UPGrid>
      </Section>

      <Section contentStyle={s.flush} title="绑定点击事件&自定义列数">
        <UPGrid border={false} col="4">
          {list.map((item) => (
            <UPGridItem customStyle={s.itemPadding} key={item.title} name={item.title}>
              <UPIcon customStyle={s.iconTop} name={item.name} size={22} />
              <Text style={s.gridText}>{item.title}</Text>
            </UPGridItem>
          ))}
        </UPGrid>
      </Section>

      <UPToast ref={toast} />

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  flush: { padding: 0 },
  gridText: { color: '#909399', fontSize: 14, paddingBottom: 10, paddingTop: 5 },
  iconTop: { paddingTop: 10 },
  itemPadding: { paddingBottom: 10, paddingTop: 10 },
});
