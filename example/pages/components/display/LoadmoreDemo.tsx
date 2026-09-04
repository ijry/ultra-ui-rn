/**
 * Loadmore 加载更多
 * 严格复刻 uview-plus pages/componentsC/loadmore/loadmore.nvue
 */
import React from 'react';
import { UPLoadmore, toast } from 'ultra-ui-rn';
import { DemoPage, PropsTable, Section } from '../_shared';

const PROPS = [
  { prop: 'status', type: "'loadmore' | 'loading' | 'nomore'", default: "'loadmore'", desc: '组件状态' },
  { prop: 'bgColor', type: 'string', default: "'transparent'", desc: '组件背景颜色' },
  { prop: 'icon', type: 'boolean', default: 'true', desc: 'loading 状态是否显示图标' },
  { prop: 'fontSize', type: 'number | string', default: '14', desc: '字体大小' },
  { prop: 'iconSize', type: 'number | string', default: '17', desc: '图标大小' },
  { prop: 'color', type: 'string', default: "'#606266'", desc: '文字颜色' },
  { prop: 'loadingIcon', type: "'spinner' | 'circle' | 'semicircle'", default: "'spinner'", desc: '加载图标形状' },
  { prop: 'loadmoreText', type: 'string', default: "'加载更多'", desc: 'loadmore 状态的提示语' },
  { prop: 'loadingText', type: 'string', default: "'加载中...'", desc: 'loading 状态的提示语' },
  { prop: 'nomoreText', type: 'string', default: "'没有更多了'", desc: 'nomore 状态的提示语' },
  { prop: 'isDot', type: 'boolean', default: 'false', desc: 'nomore 状态是否显示一个点替代文字' },
  { prop: 'iconColor', type: 'string', default: "'#b7b7b7'", desc: '加载图标颜色' },
  { prop: 'marginTop', type: 'number | string', default: '10', desc: '上边距' },
  { prop: 'marginBottom', type: 'number | string', default: '10', desc: '下边距' },
  { prop: 'height', type: "number | string | 'auto'", default: "'auto'", desc: '组件高度' },
  { prop: 'line', type: 'boolean', default: 'false', desc: '是否显示左右两侧的横线' },
  { prop: 'lineColor', type: 'string', default: "'#E6E8EB'", desc: '横线颜色' },
  { prop: 'dashed', type: 'boolean', default: 'false', desc: '横线是否虚线' },
  { prop: 'onLoadmore', type: '() => void', default: '—', desc: 'loadmore 状态下点击时触发' },
];

export default function LoadmoreDemo() {
  const loadmore = () => {
    toast.default('加载更多');
  };

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPLoadmore iconSize={17} isDot status="loading" />
      </Section>

      <Section title="无更多数据">
        <UPLoadmore line status="nomore" />
      </Section>

      <Section title="加载更多(点击触发事件)">
        <UPLoadmore line onLoadmore={loadmore} status="loadmore" />
      </Section>

      <Section title="自定义图标">
        <UPLoadmore loadingIcon="circle" status="loading" />
      </Section>

      <Section title="显示点">
        <UPLoadmore color="#909399" isDot line status="nomore" />
      </Section>

      <Section title="自定义提示语">
        <UPLoadmore color="#909399" loadingText="努力加载中,先喝杯茶" status="loading" />
      </Section>

      <Section title="自定义线条颜色">
        <UPLoadmore color="#1CD29B" dashed line lineColor="#1CD29B" loadmoreText="看,我和别人不一样" />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
