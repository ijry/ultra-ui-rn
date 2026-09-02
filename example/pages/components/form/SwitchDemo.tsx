/**
 * Switch 开关
 * 严格复刻 uview-plus pages/componentsB/switch/switch.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPModal, UPSwitch } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'boolean | string | number', default: 'false', desc: '开关选中状态（v-model）' },
  { prop: 'loading', type: 'boolean', default: 'false', desc: '是否处于加载中' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'size', type: 'number | string', default: '25', desc: '开关尺寸' },
  { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '打开时的背景色' },
  { prop: 'inactiveColor', type: 'string', default: '#fff', desc: '关闭时的背景色' },
  { prop: 'activeValue', type: 'boolean | string | number', default: 'true', desc: '打开时的值' },
  { prop: 'inactiveValue', type: 'boolean | string | number', default: 'false', desc: '关闭时的值' },
  { prop: 'asyncChange', type: 'boolean', default: 'false', desc: '是否开启异步变更（需手动改值）' },
  { prop: 'space', type: 'number | string', default: '0', desc: '圆点与外边框的距离' },
  { prop: 'onChange', type: '(value) => void', default: '—', desc: '状态改变时触发' },
];

/** Upstream wraps each switch in `.u-page__tag-item` (`margin-right: 30px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function SwitchDemo() {
  const [value1, setValue1] = useState(false);
  const [value2, setValue2] = useState(true);
  const [value3, setValue3] = useState(false);
  const [value4, setValue4] = useState(true);
  const [value5] = useState(false);
  const [value6] = useState(true);
  const [value7, setValue7] = useState(false);
  const [value8, setValue8] = useState(true);
  const [value9, setValue9] = useState(true);
  const [value10, setValue10] = useState(true);
  const [value11, setValue11] = useState(false);
  const [value12, setValue12] = useState(true);
  const [value13, setValue13] = useState(true);
  const [pending, setPending] = useState<boolean | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const change = (e: string | number | boolean) =>
    setEvents((prev) => [...prev, `change: ${String(e)}`]);

  // Upstream uses uni.showModal to confirm before committing the async change.
  const asyncChange = (e: string | number | boolean) => setPending(Boolean(e));

  return (
    <DemoPage>
      <Section direction="row" title="基础功能">
        <Item>
          <UPSwitch onChange={(next) => { setValue1(Boolean(next)); change(next); }} value={value1} />
          <Text>{String(value1)}</Text>
        </Item>
        <Item>
          <UPSwitch onChange={(next) => setValue2(Boolean(next))} value={value2} />
          <Text>{String(value2)}</Text>
        </Item>
      </Section>

      <Section direction="row" title="加载中">
        <Item>
          <UPSwitch loading onChange={(next) => setValue3(Boolean(next))} value={value3} />
        </Item>
        <Item>
          <UPSwitch loading onChange={(next) => setValue4(Boolean(next))} value={value4} />
        </Item>
      </Section>

      <Section direction="row" title="禁用状态">
        <Item>
          <UPSwitch disabled value={value5} />
        </Item>
        <Item>
          <UPSwitch disabled value={value6} />
        </Item>
      </Section>

      <Section direction="row" title="自定义尺寸">
        <Item>
          <UPSwitch onChange={(next) => setValue7(Boolean(next))} size="28" value={value7} />
        </Item>
        <Item>
          <UPSwitch onChange={(next) => setValue8(Boolean(next))} size="20" value={value8} />
        </Item>
      </Section>

      <Section direction="row" title="自定义颜色">
        <Item>
          <UPSwitch
            activeColor="#f56c6c"
            loading
            onChange={(next) => setValue9(Boolean(next))}
            value={value9}
          />
        </Item>
        <Item>
          <UPSwitch
            activeColor="#5ac725"
            loading
            onChange={(next) => setValue10(Boolean(next))}
            value={value10}
          />
        </Item>
      </Section>

      <Section direction="row" title="自定义样式">
        <Item>
          <UPSwitch
            activeColor="#f56c6c"
            inactiveColor="rgb(230, 230, 230)"
            onChange={(next) => setValue11(Boolean(next))}
            space={2}
            value={value11}
          />
        </Item>
        <Item>
          <UPSwitch
            activeColor="#f9ae3d"
            inactiveColor="rgb(230, 230, 230)"
            onChange={(next) => setValue12(Boolean(next))}
            space="2"
            value={value12}
          />
        </Item>
      </Section>

      <Section direction="row" title="异步控制">
        <Item>
          <UPSwitch asyncChange onChange={asyncChange} value={value13} />
        </Item>
      </Section>

      <UPModal
        content={pending ? '确定要打开吗' : '确定要关闭吗'}
        onCancel={() => setPending(null)}
        onChangeShow={(next) => { if (!next) setPending(null); }}
        onConfirm={() => { if (pending !== null) setValue13(pending); setPending(null); }}
        show={pending !== null}
        showCancelButton
      />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { alignItems: 'center', flexDirection: 'row', marginRight: 30 },
});
