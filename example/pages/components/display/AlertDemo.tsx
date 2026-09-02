/**
 * Alert 警告提示
 * 严格复刻 uview-plus pages/componentsB/alert/alert.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPAlert } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'title', type: 'string', default: '—', desc: '显示的标题文字' },
  { prop: 'description', type: 'string', default: '—', desc: '辅助性文字，字号比 title 小' },
  { prop: 'type', type: "'primary' | 'success' | 'error' | 'warning' | 'info'", default: "'warning'", desc: '主题类型' },
  { prop: 'effect', type: "'light' | 'dark'", default: "'light'", desc: '浅或深色调' },
  { prop: 'showIcon', type: 'boolean', default: 'false', desc: '是否显示左侧辅助图标' },
  { prop: 'closable', type: 'boolean', default: 'false', desc: '是否显示右侧关闭按钮' },
  { prop: 'center', type: 'boolean', default: 'false', desc: '文字是否居中' },
  { prop: 'fontSize', type: 'number | string', default: '14', desc: '字体大小' },
  { prop: 'closeNode', type: 'ReactNode', default: '—', desc: '自定义关闭图标（源 close 插槽）' },
  { prop: 'onClose', type: '() => void', default: '—', desc: '点击关闭按钮时触发' },
];

/** Upstream wraps each alert in `.u-alert-item` (`flex: 1; margin-bottom: 10px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function AlertDemo() {
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage>
      <Section contentStyle={s.stretch} title="基础功能">
        <Item>
          <UPAlert description="山不在于高，有了神仙就出名" />
        </Item>
        <Item>
          <UPAlert description="水不在深，有龙则灵" type="primary" />
        </Item>
        <Item>
          <UPAlert description="斯是陋室，惟吾德馨。苔痕上阶绿，草色入帘青" type="error" />
        </Item>
        <Item>
          <UPAlert description="谈笑有鸿儒，往来无白丁" type="info" />
        </Item>
        <Item>
          <UPAlert description="可以调素琴，阅金经" type="success" />
        </Item>
      </Section>

      <Section contentStyle={s.stretch} title="深浅色">
        <Item>
          <UPAlert description="无丝竹之乱耳，无案牍之劳形" type="warning" />
        </Item>
        <Item>
          <UPAlert
            description="南阳诸葛庐，西蜀子云亭。孔子云：何陋之有"
            effect="dark"
            type="warning"
          />
        </Item>
      </Section>

      <Section contentStyle={s.stretch} title="显示图标">
        <Item>
          <UPAlert description="六王毕，四海一；蜀山兀，阿房出" showIcon type="error" />
        </Item>
        <Item>
          <UPAlert
            description="覆压三百余里，隔离天日。骊山北构而西折，直走咸阳，二川溶溶，流入宫墙"
            effect="dark"
            showIcon
            type="error"
          />
        </Item>
      </Section>

      <Section contentStyle={s.stretch} title="可关闭">
        <Item>
          <UPAlert
            closable
            description="五步一楼，十步一阁；廊腰缦回，檐牙高啄；各抱地势，钩心斗角"
            showIcon
            type="success"
          />
        </Item>
        <Item>
          <UPAlert
            closable
            description="盘盘焉，囷囷焉，蜂房水涡，矗不知其几千万落"
            effect="dark"
            onClose={() => setEvents((prev) => [...prev, 'close'])}
            showIcon
            type="success"
          />
        </Item>
      </Section>

      <Section contentStyle={s.stretch} title="带标题">
        <Item>
          <UPAlert
            closable
            description="长桥卧波，未云何龙？复道行空，不霁何虹"
            showIcon
            title="妃嫔媵嫱，王子皇孙，辞楼下殿"
            type="info"
          />
        </Item>
        <Item>
          <UPAlert
            closable
            description="高低冥迷，不知西东。歌台暖响，春光融融；舞殿冷袖，风雨凄凄。一日之内，一宫之间，而气候不齐"
            effect="dark"
            showIcon
            title="辇来于秦，朝歌夜弦，为秦宫人。明星荧荧，开妆镜也"
            type="info"
          />
        </Item>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, marginBottom: 10 },
  stretch: { alignItems: 'stretch' },
});
