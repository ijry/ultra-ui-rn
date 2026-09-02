/**
 * Tabs 标签
 * 严格复刻 uview-plus pages/componentsC/tabs/tabs.nvue
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UPButton, UPGap, UPIcon, UPSticky, UPTabs, toast, type UPTabItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'list', type: 'TabItem[]', default: '[]', desc: '标签数组' },
  { prop: 'current', type: 'number | string', default: '0', desc: '当前选中项索引（v-model）' },
  { prop: 'keyName', type: 'string', default: "'name'", desc: '读取标签文字的字段名' },
  { prop: 'scrollable', type: 'boolean', default: 'true', desc: '标签是否可横向滚动' },
  { prop: 'lineColor', type: 'string', default: '#3c9cff', desc: '滑块颜色' },
  { prop: 'lineWidth', type: 'number | string', default: '20', desc: '滑块宽度' },
  { prop: 'lineHeight', type: 'number | string', default: '3', desc: '滑块高度' },
  { prop: 'activeStyle', type: 'TextStyle', default: '—', desc: '选中项样式' },
  { prop: 'inactiveStyle', type: 'TextStyle', default: '—', desc: '未选中项样式' },
  { prop: 'itemStyle', type: 'ViewStyle', default: '—', desc: '每个标签的样式' },
  { prop: 'shapeMode', type: "'' | 'capsule' | 'card' | 'pill-arrow' | 'tag'", default: "''", desc: '标签外形模式' },
  { prop: 'left', type: 'ReactNode', default: '—', desc: '左侧自定义内容（源 left 插槽）' },
  { prop: 'right', type: 'ReactNode', default: '—', desc: '右侧自定义内容（源 right 插槽）' },
  { prop: 'renderItem', type: '(item, index) => ReactNode', default: '—', desc: '自定义标签内容（源默认插槽）' },
  { prop: 'onClick', type: '(item, index) => void', default: '—', desc: '点击标签时触发' },
];

const NAMES = ['关注', '推荐', '电影', '科技', '音乐', '美食', '文化', '财经', '手工'];

const list1: UPTabItem[] = NAMES.map((name) => ({ name }));

const list2: UPTabItem[] = NAMES.map((name) => {
  if (name === '推荐') return { name, badge: { isDot: true } };
  if (name === '电影') return { name, badge: { value: 5 } };
  return { name };
});

const list3: UPTabItem[] = NAMES.map((name) =>
  name === '电影' ? { name, disabled: true } : { name },
);

const list4: UPTabItem[] = NAMES.map((name) =>
  name === '推荐' ? { name, badge: { isDot: true } } : { name },
);

const list6: UPTabItem[] = [{ name: '关注' }, { name: '推荐' }, { name: '电影' }, { name: '科技' }];
const listShape: UPTabItem[] = [{ name: '关注' }, { name: '推荐' }, { name: '电影' }];
const listCard: UPTabItem[] = [{ name: '账号登录' }, { name: '免密登录' }];
const listPillArrow: UPTabItem[] = [{ name: '关注' }, { name: '精选' }, { name: '热门' }];
const listTag: UPTabItem[] = [
  { name: '全部' },
  { name: '待付款' },
  { name: '待发货' },
  { name: '已发货' },
  { name: '已完成' },
  { name: '已关闭' },
];

const ACTIVE_STYLE = { color: '#303133', fontWeight: 'bold' } as const;
const INACTIVE_STYLE = { color: '#606266' } as const;

export default function TabsDemo() {
  const [list1Current, setList1Current] = useState(1);
  const [events, setEvents] = useState<string[]>([]);

  const click = (item: UPTabItem & { index: number }) => {
    setEvents((prev) => [...prev, `item: ${String(item.name)}`]);
  };

  const nextTab = () => {
    setList1Current((prev) => (list1.length <= prev + 1 ? 0 : prev + 1));
  };

  return (
    <DemoPage>
      <Section title="基础演示">
        <UPTabs current={3} list={list1} onClick={click} />
      </Section>

      <Section contentStyle={s.transparent} title="粘性布局">
        <UPSticky bgColor="#fff">
          <UPTabs list={list1} />
        </UPSticky>
        <UPGap height={23} />
      </Section>

      <Section title="显示徽标">
        <UPTabs list={list2} />
      </Section>

      <Section title="禁止滚动">
        <UPTabs list={list6} scrollable={false} />
      </Section>

      <Section title="禁用菜单">
        <UPTabs list={list3} />
      </Section>

      <Section title="自定义样式">
        <UPTabs
          activeStyle={ACTIVE_STYLE}
          inactiveStyle={INACTIVE_STYLE}
          itemStyle={s.itemStyle}
          lineColor="#f56c6c"
          lineWidth="30"
          list={list4}
        />
      </Section>

      <Section title="滑块设置背景图">
        {/* 源用 base64 图作 lineColor 的 CSS background；RN 无此能力，退化为纯色滑块。 */}
        <UPTabs
          activeStyle={ACTIVE_STYLE}
          inactiveStyle={INACTIVE_STYLE}
          itemStyle={s.itemStyle}
          lineHeight="7"
          lineWidth="20"
          list={list4}
        />
      </Section>

      <Section title="自定义内容插槽">
        <UPTabs
          list={list1}
          renderItem={(item) => <Text style={s.redText}>{String(item.name ?? '-')}</Text>}
        />
      </Section>

      <Section title="右侧自定义插槽">
        <UPTabs
          current={list1Current}
          list={list1}
          onUpdateCurrent={setList1Current}
          right={
            <Pressable onPress={() => toast.default('插槽被点击')} style={s.rightSlot}>
              <UPIcon name="list" size={21} />
            </Pressable>
          }
        />
        <UPButton
          customStyle={s.nextButton}
          onClick={nextTab}
          size="small"
          text={`切换下一个${list1Current}`}
          type="primary"
        />
      </Section>

      <Section title="胶囊模式">
        <UPTabs list={listShape} scrollable={false} shapeMode="capsule" />
      </Section>

      <Section title="卡片模式">
        <UPTabs list={listCard} lineWidth="26" scrollable={false} shapeMode="card" />
      </Section>

      <Section title="圆角矩形箭头模式">
        <UPTabs list={listPillArrow} scrollable={false} shapeMode="pill-arrow" />
      </Section>

      <Section title="Tag模式">
        <UPTabs list={listTag} shapeMode="tag" />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  itemStyle: { height: 34, paddingHorizontal: 15 },
  nextButton: { marginTop: 10, width: 120 },
  redText: { color: 'red' },
  rightSlot: { paddingLeft: 4 },
  transparent: { backgroundColor: 'transparent', padding: 0 },
});
