/**
 * Dragsort 拖拽排序
 * 严格复刻 uview-plus pages/componentsD/dragsort/dragsort.vue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPAlert, UPDragsort } from 'ultra-ui-rn';
import { DemoPage, PageItem } from '../_shared';

type ListItem = { id: number; label: string };

export default function DragsortDemo() {
  const [list] = useState<ListItem[]>([
    { id: 1, label: '项目 A' },
    { id: 2, label: '项目 B' },
    { id: 3, label: '项目 C' },
    { id: 4, label: '项目 D' },
    { id: 5, label: '项目 E' },
    { id: 6, label: '项目 F' },
    { id: 7, label: '项目 G' },
    { id: 8, label: '项目 H' },
  ]);

  const [list2] = useState<ListItem[]>([
    { id: 1, label: '横向 A' },
    { id: 2, label: '横向 B' },
    { id: 3, label: '横向 C' },
    { id: 4, label: '横向 D' },
    { id: 5, label: '横向 E' },
    { id: 6, label: '横向 F' },
    { id: 7, label: '横向 G' },
    { id: 8, label: '横向 H' },
  ]);

  const handleDragEnd = (sortedList: readonly ListItem[]) => {
    console.log('拖拽结束，新的顺序:', sortedList);
  };

  return (
    <DemoPage>
      <UPAlert customStyle={s.alert} description="PC端查看时需要触摸仿真模式才会正确计算位置" />

      <PageItem title="单列多行模式">
        <UPDragsort initialList={list} onDragEnd={handleDragEnd}>
          {({ item, index }) => (
            <View style={s.customItem}>
              <Text>序号：{index + 1}</Text>
              <Text> - </Text>
              <Text>{item.label}</Text>
            </View>
          )}
        </UPDragsort>
      </PageItem>

      <PageItem title="自定义拖动句柄">
        <UPDragsort
          initialList={list}
          onDragEnd={handleDragEnd}
          renderHandler={() => (
            <View style={s.customItemHandler}>
              <View style={s.handle} />
            </View>
          )}
        >
          {({ item, index }) => (
            <View style={s.customItem}>
              <Text>序号：{index + 1}</Text>
              <Text> - </Text>
              <Text>{item.label}</Text>
            </View>
          )}
        </UPDragsort>
      </PageItem>

      <PageItem title="多行多列模式">
        <UPDragsort
          columns={3}
          direction="all"
          draggable
          initialList={list}
          onDragEnd={handleDragEnd}
        >
          {({ item }) => (
            <View style={s.wrapper}>
              <View style={s.customItemH}>
                <Text>{item.label}</Text>
              </View>
            </View>
          )}
        </UPDragsort>
      </PageItem>

      <PageItem title="单行横向拖动">
        <UPDragsort
          direction="horizontal"
          draggable
          initialList={list2}
          onDragEnd={handleDragEnd}
        >
          {({ item }) => (
            <View style={s.wrapper}>
              <View style={s.customItemH}>
                <Text>{item.label}</Text>
              </View>
            </View>
          )}
        </UPDragsort>
      </PageItem>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  alert: {
    marginBottom: 10,
  },
  customItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: 'rgba(125, 126, 128, 0.35)',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  customItemH: {
    backgroundColor: '#fff',
    borderColor: 'rgba(125, 126, 128, 0.35)',
    borderRadius: 4,
    borderWidth: 1,
    padding: 10,
  },
  customItemHandler: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    padding: 10,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  handle: {
    backgroundColor: '#666',
    height: 2,
    position: 'relative',
    width: 10,
  },
  wrapper: {
    paddingRight: 5,
  },
});
