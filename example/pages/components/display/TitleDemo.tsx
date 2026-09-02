/**
 * Title 标题
 * 严格复刻 uview-plus pages/componentsD/title/title.nvue
 */
import React from 'react';
import { UPIcon, UPTitle } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'prefix', type: 'ReactNode', default: '—', desc: '自定义前缀（源 prefix 插槽），默认为竖条标记' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '标题内容（源默认插槽）' },
  { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '自定义外层样式' },
];

export default function TitleDemo() {
  return (
    <DemoPage>
      <PageItem title="默认">
        <UPTitle>默认标题</UPTitle>
      </PageItem>

      <PageItem title="自定义前缀">
        <UPTitle prefix={<UPIcon color="red" name="level" size="16px" />}>等级3</UPTitle>
      </PageItem>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
