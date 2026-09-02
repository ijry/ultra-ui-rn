/**
 * SwipeAction 滑动单元格
 * 严格复刻 uview-plus pages/componentsA/swipeAction/swipeAction.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  UPModal,
  UPSwipeAction,
  UPSwipeActionItem,
  type UPSwipeActionOption,
} from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'options', type: 'SwipeActionOption[]', default: '[]', desc: '右侧按钮组配置' },
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否展开右侧按钮（v-model）' },
  { prop: 'name', type: 'string | number', default: '—', desc: '标识符，用于多项互斥' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用滑动' },
  { prop: 'closeOnClick', type: 'boolean', default: 'true', desc: '点击按钮后是否自动收起' },
  { prop: 'autoClose', type: 'boolean', default: 'true', desc: '打开一个时是否收起其他项' },
  { prop: 'threshold', type: 'number', default: '20', desc: '触发滑动的最小距离' },
  { prop: 'onClick', type: '({ index, name }) => void', default: '—', desc: '点击右侧按钮时触发' },
  { prop: 'onOpen', type: '(name) => void', default: '—', desc: '展开时触发' },
  { prop: 'onClose', type: '(name) => void', default: '—', desc: '收起时触发' },
];

const options1: UPSwipeActionOption[] = [
  { text: '删除', style: { backgroundColor: '#f56c6c' } },
];

const options2: UPSwipeActionOption[] = [
  { text: '收藏', style: { backgroundColor: '#3c9cff' } },
  { text: '删除', style: { backgroundColor: '#f56c6c' } },
];

const options3: UPSwipeActionOption[] = [
  { text: '收藏', icon: 'star-fill', iconSize: '20', style: { backgroundColor: '#f9ae3d' } },
];

const groupOptions: UPSwipeActionOption[] = [
  { text: '置顶', style: { backgroundColor: '#3c9cff' } },
  { text: '取消', style: { backgroundColor: '#f9ae3d' } },
];

const options4 = [
  { text: '禁用状态', disabled: true, options: groupOptions },
  { text: '正常状态', disabled: false, options: groupOptions },
  { text: '自动关闭', disabled: false, options: groupOptions },
];

const CIRCLE_STYLE = {
  borderRadius: 100,
  height: 40,
  marginHorizontal: 6,
  width: 40,
} as const;

const options5: UPSwipeActionOption[] = [
  { icon: 'trash-fill', style: { backgroundColor: '#f56c6c', ...CIRCLE_STYLE } },
  { icon: 'heart-fill', style: { backgroundColor: '#5ac725', ...CIRCLE_STYLE } },
];

export default function SwipeActionDemo() {
  const [show1, setShow1] = useState(true);
  const [swshow1, setSwshow1] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  // 源在 click 里 uni.showModal 二次确认，确认后隐藏整行。
  const click = (event: { index: number; name: string | number }) => {
    setEvents((prev) => [...prev, `click ${event.index}`]);
    setConfirming(true);
  };

  return (
    <DemoPage>
      <Section contentStyle={s.flush} title="演示案例">
        <UPSwipeAction>
          {show1 ? (
            <UPSwipeActionItem
              closeOnClick={false}
              onClick={click}
              onUpdateShow={setSwshow1}
              options={options1}
              show={swshow1}
            >
              <View style={s.row}>
                <Text style={s.rowText}>基础使用</Text>
              </View>
            </UPSwipeActionItem>
          ) : null}
        </UPSwipeAction>
      </Section>

      <Section contentStyle={s.flush} title="按钮组">
        <UPSwipeAction>
          <UPSwipeActionItem closeOnClick options={options2}>
            <View style={s.row}>
              <Text style={s.rowText}>两个按钮并列</Text>
            </View>
          </UPSwipeActionItem>
        </UPSwipeAction>
      </Section>

      <Section contentStyle={s.flush} title="带图标">
        <UPSwipeAction>
          <UPSwipeActionItem options={options3}>
            <View style={s.row}>
              <Text style={s.rowText}>自定义图标</Text>
            </View>
          </UPSwipeActionItem>
        </UPSwipeAction>
      </Section>

      <Section contentStyle={s.flush} title="组合使用">
        <UPSwipeAction>
          {options4.map((item) => (
            <UPSwipeActionItem disabled={item.disabled} key={item.text} options={item.options}>
              <View style={s.row}>
                <Text style={s.rowText}>{item.text}</Text>
              </View>
            </UPSwipeActionItem>
          ))}
        </UPSwipeAction>
      </Section>

      <Section contentStyle={s.flush} title="自定义按钮形状">
        <UPSwipeAction>
          <UPSwipeActionItem options={options5}>
            <View style={s.row}>
              <Text style={s.rowText}>圆形按钮</Text>
            </View>
          </UPSwipeActionItem>
        </UPSwipeAction>
      </Section>

      <UPModal
        content="确定要删除吗？"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setSwshow1(false);
          setShow1(false);
          setConfirming(false);
        }}
        show={confirming}
        showCancelButton
        title="温馨提示"
      />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  flush: { padding: 0 },
  row: {
    borderBottomColor: '#dadbde',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dadbde',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  rowText: { color: '#303133', fontSize: 15, paddingLeft: 15 },
});
