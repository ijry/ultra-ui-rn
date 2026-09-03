/**
 * VirtualList 虚拟列表
 * 严格复刻 uview-plus pages/componentsD/virtualList/virtualList.nvue
 */
import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { UPAlert, UPCell, UPVirtualList } from 'ultra-ui-rn';
import { DemoPage, PageItem } from '../_shared';

const listData3 = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
}));

export default function VirtualListDemo() {
  // 上游为 `v-model:scrollTop`（双向绑定）。本地 scrollTop 是命令式受控值：
  // 变化时组件会立即 scrollTo，把滚动回调值回灌进去会打断手势/惯性，
  // 因此这里只保存在 ref 中，仅复刻 `update:scrollTop` 的发射侧。
  const scrollTop = useRef(0);

  return (
    <DemoPage>
      <UPAlert customStyle={s.alert} description="PC端查看时需要触摸仿真模式" />

      <PageItem title="基本使用">
        <UPVirtualList
          height="800px"
          itemHeight={49}
          listData={listData3}
          onUpdateScrollTop={(top) => {
            scrollTop.current = top;
          }}
        >
          {/* 上游 `@scroll="onScroll3"` 为空实现，无可复刻的反馈 */}
          {({ item }) => <UPCell title={`Item${item.id}`} />}
        </UPVirtualList>
      </PageItem>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  // 上游 `class="u-m-b-20"`：margin-bottom: 20rpx
  alert: { marginBottom: 10 },
});
