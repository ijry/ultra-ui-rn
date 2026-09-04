/**
 * FloatButton 悬浮按钮
 * 严格复刻 uview-plus pages/componentsD/floatButton/floatButton.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPFloatButton, UPGap, UPIcon, type UPFloatButtonItem } from 'ultra-ui-rn';
import { DemoPage, EventLog, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'backgroundColor', type: 'string', default: "'#2979ff'", desc: '按钮背景色' },
  { prop: 'color', type: 'string', default: "'#fff'", desc: '图标颜色' },
  { prop: 'width', type: 'number | string', default: "'50px'", desc: '按钮宽度' },
  { prop: 'height', type: 'number | string', default: "'50px'", desc: '按钮高度' },
  { prop: 'borderColor', type: 'string', default: "''", desc: '边框颜色，为空时不显示边框' },
  { prop: 'right', type: 'number | string', default: "'30px'", desc: '距右侧距离' },
  { prop: 'top', type: 'number | string', default: "''", desc: '距顶部距离' },
  { prop: 'bottom', type: 'number | string', default: "''", desc: '距底部距离' },
  { prop: 'isMenu', type: 'boolean', default: 'false', desc: '是否为子菜单模式' },
  { prop: 'list', type: 'FloatButtonItem[]', default: '[]', desc: '子菜单项，含 name/color/backgroundColor/borderColor' },
  { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '定义需要用到的外部样式' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '默认插槽：替换主按钮内容' },
  { prop: 'listContent', type: 'ReactNode', default: '—', desc: 'list 插槽：自定义子菜单内容' },
  { prop: 'onClick', type: '(event) => void', default: '—', desc: '点击主按钮时触发' },
  { prop: 'onItemClick', type: '(item & { index }) => void', default: '—', desc: '点击子菜单项时触发' },
];

const menuList: UPFloatButtonItem[] = [
  { key: 'plus', name: 'plus', color: '#fff', backgroundColor: 'red' },
  { key: 'order', name: 'order', color: '#fff', backgroundColor: 'green' },
];

export default function FloatButtonDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const itemClick = (item: UPFloatButtonItem & { index: number }) =>
    setEvents((prev) => [...prev, `item-click: ${JSON.stringify(item)}`]);

  return (
    <DemoPage>
      {/* RN 无 position: fixed，UPFloatButton 的 top/bottom/right 相对最近的父容器
          （此处为各 PageItem 卡片）定位，上游是相对视口。 */}
      <PageItem title="基础功能">
        <UPFloatButton isMenu={false} top="90px" />
      </PageItem>
      <UPGap height={50} />

      <PageItem title="带子菜单模式">
        <UPFloatButton isMenu list={menuList} onItemClick={itemClick} top="220px" />
      </PageItem>
      <UPGap height={50} />

      <PageItem title="自定义插槽">
        {/* listContent（上游 #list 插槽）不会套用内置的绝对定位列表容器，
            自定义项排在主按钮上方的常规流里，而非悬浮堆叠。 */}
        <UPFloatButton
          bottom="250px"
          isMenu
          listContent={
            <>
              <View style={[s.slotItem, s.slotItemFirst]}>
                <UPIcon color="#fff" name="arrow-left" size={19} />
              </View>
              <View style={[s.slotItem, s.slotItemSecond]}>
                <UPIcon color="#fff" name="arrow-left" size={19} />
              </View>
            </>
          }
          top=""
        />
      </PageItem>
      <UPGap height={50} />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  slotItem: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginVertical: 5,
    width: 50,
  },
  slotItemFirst: { backgroundColor: 'blueviolet' },
  slotItemSecond: { backgroundColor: 'chocolate' },
});
