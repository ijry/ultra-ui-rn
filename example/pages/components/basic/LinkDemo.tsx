/**
 * UPLink 组件示例 — 链接
 * 复刻 uview-plus pages/componentsA/link/link.nvue
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UPLink } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'color', type: 'string', default: '#606266', desc: '文字颜色' },
  { prop: 'fontSize', type: 'string | number', default: '15', desc: '字体大小' },
  { prop: 'underLine', type: 'boolean', default: 'false', desc: '是否显示下划线' },
  { prop: 'href', type: 'string', default: '—', desc: '跳转的链接' },
  { prop: 'lineColor', type: 'string', default: '—', desc: '下划线颜色，默认同 color' },
  { prop: 'text', type: 'string', default: '—', desc: '超链接的问题' },
  { prop: 'mpTips', type: 'string', default: "'链接已复制，请在浏览器打开'", desc: '各个小程序平台把链接复制到粘贴板后的提示语' },
];

/** Upstream wraps each link in `.u-page__link-item` (`margin-top: 5px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function LinkDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const log = (msg: string) => setEvents((prev) => [...prev, msg]);

  return (
    <DemoPage>
      <Section title="基本案例">
        <Item>
          <UPLink
            href="https://uview-plus.jiangruyi.com/"
            text="打开uview-plus文档"
            onClick={() => log('click')}
          />
        </Item>
      </Section>

      <Section title="显示下划线">
        <Item>
          <UPLink
            href="https://uview-plus.jiangruyi.com/"
            underLine
            text="Go to uview-plus doc"
          />
        </Item>
      </Section>

      <Section title="自定义颜色">
        <Item>
          <UPLink
            href="https://uview-plus.jiangruyi.com/"
            lineColor="#19be6b"
            color="#19be6b"
            text="打开uview-plus文档"
          />
        </Item>
      </Section>

      <Section title="自定义链接内容">
        <Item>
          <UPLink href="https://uniapp.dcloud.io/" text="打开uni-app文档" />
        </Item>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { marginTop: 5 },
});
