/**
 * Copy 复制
 * 严格复刻 uview-plus pages/componentsD/copy/copy.nvue
 */
import React from 'react';
import { Clipboard, Text } from 'react-native';
import { UPButton, UPCopy } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'content', type: 'string | number', default: "''", desc: '需要复制的内容' },
  { prop: 'alertStyle', type: 'string', default: "'toast'", desc: "复制成功后的提示方式，'modal' 走弹窗，其余走 toast" },
  { prop: 'notice', type: 'string', default: "'复制成功'", desc: '复制成功后的提示文案' },
  { prop: 'writeText', type: '(content: string) => void | Promise<void>', default: '—', desc: 'RN 端剪贴板适配器，源组件内部直接调用 uni.setClipboardData' },
  { prop: 'onSuccess', type: '() => void', default: '—', desc: '写入剪贴板成功后触发' },
  { prop: 'children', type: 'ReactNode', default: "'复制'", desc: '被点击的内容（源默认插槽）' },
];

/**
 * 源 up-copy 内部调用 uni.setClipboardData；RN 版必须由宿主注入 writeText 适配器，
 * 这里用 react-native 核心 Clipboard（H5 下由 react-native-web 提供同名实现）。
 */
const writeText = (content: string) => {
  Clipboard.setString(content);
};

export default function CopyDemo() {
  return (
    <DemoPage>
      <PageItem title="点击文字复制">
        <UPCopy content="uview-plus is great !" writeText={writeText}>
          <Text>点击复制</Text>
        </UPCopy>
      </PageItem>

      <PageItem title="点击按钮复制">
        {/* 源 up-copy 把 @tap 挂在包裹层，uni-app 中按钮的 tap 会冒泡上来。RN 把手势
            交给最内层 Pressable，嵌套的 UPButton 会抢走它，所以 UPCopy 的包裹层同时
            监听原生 touch 事件（祖先即使不是 responder 也能收到）来复现这个冒泡。 */}
        <UPCopy content="uview-plus is great !" writeText={writeText}>
          <UPButton type="primary">点击复制</UPButton>
        </UPCopy>
      </PageItem>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
