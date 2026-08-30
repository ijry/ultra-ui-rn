/**
 * UPDropdown 组件示例 — 下拉菜单
 * 展示：基础用法、禁用项、自定义颜色
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPDropdown, UPDropdownItem } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '激活项颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#606266', desc: '未激活项颜色' },
  { prop: 'height', type: 'number | string', default: '40', desc: '菜单栏高度' },
  { prop: 'borderBottom', type: 'boolean', default: 'false', desc: '显示底部边框' },
  { prop: 'menuIcon', type: 'string', default: 'arrow-down', desc: '菜单图标名' },
  { prop: 'closeOnClickMask', type: 'boolean', default: 'true', desc: '点击遮罩关闭' },
  { prop: 'closeOnClickSelf', type: 'boolean', default: 'false', desc: '再次点击自身关闭' },
  { prop: 'onOpen', type: '(index: number) => void', default: '—', desc: '展开回调' },
  { prop: 'onClose', type: '(index: number) => void', default: '—', desc: '收起回调' },
];

export default function DropdownDemo({ onBack }: DemoProps) {
  const [selected, setSelected] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="Dropdown 下拉菜单" onBack={onBack}>
      <Section title="基础用法">
        <UPDropdown borderBottom onOpen={(i) => log(`open: ${i}`)} onClose={(i) => log(`close: ${i}`)}>
          <UPDropdownItem value="price" title="价格">
            <View style={{ padding: 12 }}>
              {['综合排序', '价格从低到高', '价格从高到低'].map((item, i) => (
                <View key={i} style={{ paddingVertical: 10 }}>
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
          </UPDropdownItem>
          <UPDropdownItem value="filter" title="筛选">
            <View style={{ padding: 12 }}>
              {['全部', '新品', '热销', '好评'].map((item, i) => (
                <View key={i} style={{ paddingVertical: 10 }}>
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
          </UPDropdownItem>
          <UPDropdownItem value="sort" title="排序">
            <View style={{ padding: 12 }}>
              {['销量', '信用', '价格'].map((item, i) => (
                <View key={i} style={{ paddingVertical: 10 }}>
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
          </UPDropdownItem>
        </UPDropdown>
      </Section>

      <Section title="自定义颜色">
        <UPDropdown activeColor="#07c160">
          <UPDropdownItem value="cat1" title="分类一">
            <View style={{ padding: 12 }}>
              <Text>分类一内容</Text>
            </View>
          </UPDropdownItem>
          <UPDropdownItem value="cat2" title="分类二">
            <View style={{ padding: 12 }}>
              <Text>分类二内容</Text>
            </View>
          </UPDropdownItem>
        </UPDropdown>
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
