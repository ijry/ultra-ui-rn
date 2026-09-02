/**
 * UPTag 组件示例 — 标签
 * 复刻 uview-plus pages/componentsB/tag/tag.nvue
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UPTag } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'type', type: "'info' | 'primary' | 'success' | 'warning' | 'error'", default: "'primary'", desc: '主题类型' },
  { prop: 'disabled', type: 'boolean | string', default: 'false', desc: '是否禁用' },
  { prop: 'size', type: "'large' | 'medium' | 'mini'", default: "'medium'", desc: '标签尺寸' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '标签形状' },
  { prop: 'text', type: 'string | number', default: '—', desc: '标签文字' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '背景颜色，默认为空字符串' },
  { prop: 'color', type: 'string', default: '—', desc: '标签字体颜色，默认为空字符串' },
  { prop: 'borderColor', type: 'string', default: '—', desc: '标签的边框颜色' },
  { prop: 'closeColor', type: 'string', default: '#C6C7CB', desc: '关闭按钮图标的颜色' },
  { prop: 'name', type: 'string | number', default: '—', desc: '点击时返回的索引值' },
  { prop: 'plainFill', type: 'boolean', default: 'false', desc: '镂空时是否填充背景色' },
  { prop: 'plain', type: 'boolean', default: 'false', desc: '是否镂空' },
  { prop: 'closable', type: 'boolean', default: 'false', desc: '是否可关闭' },
  { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示' },
  { prop: 'icon', type: 'string', default: '—', desc: '图标名称或图片链接' },
  { prop: 'iconColor', type: 'string', default: '—', desc: '图标颜色' },
  { prop: 'textSize', type: 'UPDimension', default: '—', desc: '文字大小' },
  { prop: 'height', type: 'UPDimension', default: '—', desc: '标签高度' },
  { prop: 'padding', type: 'UPDimension', default: '—', desc: '标签内边距' },
  { prop: 'borderRadius', type: 'UPDimension', default: '—', desc: '标签圆角' },
  { prop: 'autoBgColor', type: 'number', default: '0', desc: '自动生成背景色' },
];

/** Upstream wraps each tag in `.u-page__tag-item` (`margin-right: 20px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function TagDemo() {
  const [close1, setClose1] = useState(true);
  const [close2, setClose2] = useState(true);
  const [close3, setClose3] = useState(true);
  const [radios, setRadios] = useState([{ checked: true }, { checked: false }, { checked: false }]);
  const [checkboxs, setCheckboxs] = useState([{ checked: true }, { checked: false }, { checked: false }]);
  const [events, setEvents] = useState<string[]>([]);
  const log = (msg: string) => setEvents((prev) => [...prev, msg]);

  const radioClick = (name: string | number) => {
    setRadios((prev) => prev.map((item, index) => ({ ...item, checked: index === name })));
    log(`radioClick ${name}`);
  };

  const checkboxClick = (name: string | number) => {
    setCheckboxs((prev) =>
      prev.map((item, index) => (index === name ? { ...item, checked: !item.checked } : item)),
    );
    log(`checkboxClick ${name}`);
  };

  return (
    <DemoPage>
      <Section title="基础功能" direction="row">
        <Item>
          <UPTag text="标签" plain size="mini" type="warning" />
        </Item>
      </Section>

      <Section title="自定义主题" direction="row">
        <Item>
          <UPTag text="标签" />
        </Item>
        <Item>
          <UPTag text="标签" type="warning" />
        </Item>
        <Item>
          <UPTag text="标签" type="success" />
        </Item>
        <Item>
          <UPTag text="标签" type="error" />
        </Item>
      </Section>

      <Section title="圆形标签" direction="row">
        <Item>
          <UPTag text="标签" plain shape="circle" />
        </Item>
        <Item>
          <UPTag text="标签" type="warning" shape="circle" />
        </Item>
      </Section>

      <Section title="镂空标签" direction="row">
        <Item>
          <UPTag text="标签" plain />
        </Item>
        <Item>
          <UPTag text="标签" type="warning" plain />
        </Item>
        <Item>
          <UPTag text="标签" type="success" plain />
        </Item>
        <Item>
          <UPTag text="标签" type="error" plain />
        </Item>
      </Section>

      <Section title="镂空带背景色" direction="row">
        <Item>
          <UPTag text="标签" plain plainFill />
        </Item>
        <Item>
          <UPTag text="标签" type="warning" plain plainFill />
        </Item>
        <Item>
          <UPTag text="标签" type="success" plain plainFill />
        </Item>
        <Item>
          <UPTag text="标签" type="error" plain plainFill />
        </Item>
      </Section>

      <Section title="自定义尺寸" direction="row">
        <Item>
          <UPTag text="标签" plain size="mini" />
        </Item>
        <Item>
          <UPTag text="标签" type="warning" />
        </Item>
        <Item>
          <UPTag text="标签" type="success" plain size="large" />
        </Item>
      </Section>

      <Section title="可关闭标签" direction="row">
        <Item>
          <UPTag text="标签" size="mini" closable show={close1} onClose={() => setClose1(false)} />
        </Item>
        <Item>
          <UPTag text="标签" type="warning" closable show={close2} onClose={() => setClose2(false)} />
        </Item>
        <Item>
          <UPTag
            text="标签"
            type="success"
            plain
            size="large"
            closable
            show={close3}
            onClose={() => setClose3(false)}
          />
        </Item>
      </Section>

      <Section title="带图片和图标" direction="row">
        <Item>
          <UPTag text="标签" size="mini" icon="map" plain />
        </Item>
        <Item>
          <UPTag text="标签" type="warning" icon="tags-fill" />
        </Item>
        <Item>
          <UPTag
            text="标签"
            type="success"
            plain
            size="large"
            icon="https://uview-plus.jiangruyi.com/uview/example/tag.png"
          />
        </Item>
      </Section>

      <Section title="单选标签" direction="row">
        {radios.map((item, index) => (
          <Item key={index}>
            <UPTag
              text={`选项${index + 1}`}
              plain={!item.checked}
              type="warning"
              name={index}
              onClick={radioClick}
            />
          </Item>
        ))}
      </Section>

      <Section title="多选标签" direction="row">
        {checkboxs.map((item, index) => (
          <Item key={index}>
            <UPTag
              text={`选项${index + 1}`}
              plain={!item.checked}
              type="warning"
              name={index}
              onClick={checkboxClick}
            />
          </Item>
        ))}
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { marginRight: 20 },
});

