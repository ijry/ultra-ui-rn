/**
 * Search 搜索
 * 严格复刻 uview-plus pages/componentsB/search/search.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPSearch, toast } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'string | number', default: '—', desc: '输入框的初始内容（v-model）' },
  { prop: 'shape', type: "'round' | 'square'", default: "'round'", desc: '搜索框形状' },
  { prop: 'bgColor', type: 'string', default: '#f2f2f2', desc: '搜索框背景色' },
  { prop: 'placeholder', type: 'string', default: "'请输入关键字'", desc: '占位文字内容' },
  { prop: 'clearabled', type: 'boolean', default: 'true', desc: '是否启用清除控件' },
  { prop: 'onlyClearableOnFocused', type: 'boolean', default: 'true', desc: '仅聚焦时显示清除图标' },
  { prop: 'showAction', type: 'boolean', default: 'true', desc: '是否显示右侧控件' },
  { prop: 'actionText', type: 'string', default: "'搜索'", desc: '右侧控件文字' },
  { prop: 'animation', type: 'boolean', default: 'false', desc: '是否开启动画' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用输入框' },
  { prop: 'inputAlign', type: "'left' | 'center' | 'right'", default: "'left'", desc: '输入框内容水平对齐方式' },
  { prop: 'borderColor', type: 'string', default: "'transparent'", desc: '边框颜色' },
  { prop: 'searchIcon', type: 'string', default: "'search'", desc: '左侧图标名' },
  { prop: 'searchIconColor', type: 'string', default: '—', desc: '左侧图标颜色' },
  { prop: 'placeholderColor', type: 'string', default: '#909399', desc: '占位文字颜色' },
  { prop: 'color', type: 'string', default: '#606266', desc: '输入框字体颜色' },
  { prop: 'label', type: 'string | number | null', default: 'null', desc: '搜索框左边显示的文字' },
  { prop: 'onChange', type: '(value: string) => void', default: '—', desc: '输入内容变化时触发' },
  { prop: 'onClickIcon', type: '(value: string) => void', default: '—', desc: '点击左侧图标时触发' },
];

/** Upstream `.u-page__tag-item` is `flex(column); flex: 1`. */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function SearchDemo() {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('天山雪莲');
  const [value3, setValue3] = useState('');
  const [value4, setValue4] = useState('');
  const [value5, setValue5] = useState('');
  const [value6, setValue6] = useState('');
  const [value7, setValue7] = useState('');
  const [value8, setValue8] = useState('');
  const [value9, setValue9] = useState('');
  const [value10, setValue10] = useState('');
  const [value11, setValue11] = useState('');
  const [value12, setValue12] = useState('');
  const [value13, setValue13] = useState('');
  const [value14, setValue14] = useState('');
  const [value15, setValue15] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const change = (e: string) => setEvents((prev) => [...prev, `change: ${e}`]);
  const clickIcon = () => toast.default('点击了左侧图标');

  return (
    <DemoPage>
      <Section title="基础功能">
        <Item>
          <UPSearch
            onChange={(next) => { setValue1(next); change(next); }}
            showAction={false}
            value={value1}
          />
        </Item>
      </Section>

      <Section title="设置初始值">
        <Item>
          <UPSearch onChange={setValue2} showAction={false} value={value2} />
        </Item>
      </Section>

      <Section title="搜索框形状">
        <Item>
          <UPSearch onChange={setValue3} shape="round" showAction={false} value={value3} />
        </Item>
        <View style={s.spaced}>
          <Item>
            <UPSearch onChange={setValue4} shape="square" showAction={false} value={value4} />
          </Item>
        </View>
      </Section>

      <Section title="右侧控件">
        <Item>
          <UPSearch animation onChange={setValue5} value={value5} />
        </Item>
      </Section>

      <Section title="可清空内容(仅focus时显示清除图标)">
        <Item>
          <UPSearch clearabled onChange={setValue2} showAction={false} value={value2} />
        </Item>
      </Section>

      <Section title="可清空内容(始终显示清除图标)">
        <Item>
          <UPSearch
            clearabled
            onChange={setValue2}
            onlyClearableOnFocused={false}
            showAction={false}
            value={value2}
          />
        </Item>
      </Section>

      <Section title="禁用输入框">
        <Item>
          <UPSearch
            disabled
            placeholder="输入框被禁用,可以监听点击事件进行跳转"
            showAction={false}
          />
        </Item>
      </Section>

      <Section title="点击左侧图标">
        <Item>
          <UPSearch onChange={setValue6} onClickIcon={clickIcon} showAction={false} value={value6} />
        </Item>
      </Section>

      <Section title="搜索框内容水平对齐">
        <Item>
          <UPSearch inputAlign="left" onChange={setValue7} showAction={false} value={value7} />
        </Item>
        <View style={s.spaced}>
          <Item>
            <UPSearch inputAlign="center" onChange={setValue8} showAction={false} value={value8} />
          </Item>
        </View>
        <View style={s.spaced}>
          <Item>
            <UPSearch inputAlign="right" onChange={setValue9} showAction={false} value={value9} />
          </Item>
        </View>
      </Section>

      <Section title="自定义">
        <Item>
          <UPSearch
            borderColor="rgb(230, 230, 230)"
            onChange={setValue10}
            showAction={false}
            value={value10}
          />
        </Item>
        <View style={s.spaced}>
          <Item>
            <UPSearch
              onChange={setValue11}
              searchIconColor="#FF0000"
              showAction={false}
              value={value11}
            />
          </Item>
        </View>
        <View style={s.spaced}>
          <Item>
            <UPSearch
              onChange={setValue12}
              placeholderColor="#FF0000"
              showAction={false}
              value={value12}
            />
          </Item>
        </View>
        <View style={s.spaced}>
          <Item>
            <UPSearch color="#FF0000" onChange={setValue13} showAction={false} value={value13} />
          </Item>
        </View>
        <View style={s.spaced}>
          <Item>
            <UPSearch label="手机" onChange={setValue14} showAction={false} value={value14} />
          </Item>
        </View>
        <View style={s.spaced}>
          <Item>
            <UPSearch
              onChange={setValue15}
              searchIcon="scan"
              showAction={false}
              value={value15}
            />
          </Item>
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, flexDirection: 'column' },
  spaced: { marginTop: 10 },
});
