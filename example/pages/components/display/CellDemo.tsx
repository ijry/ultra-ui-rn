/**
 * Cell 单元格
 * 严格复刻 uview-plus pages/componentsA/cell/cell.nvue
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPCell, UPCellGroup, UPGap, UPTag } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'title', type: 'string | number', default: '—', desc: '左侧标题' },
  { prop: 'label', type: 'string | number', default: '—', desc: '标题下方的描述信息' },
  { prop: 'value', type: 'string | number', default: '—', desc: '右侧内容' },
  { prop: 'icon', type: 'string', default: '—', desc: '左侧图标名或图片链接' },
  { prop: 'isLink', type: 'boolean', default: 'false', desc: '是否展示右侧箭头并开启点击反馈' },
  { prop: 'arrowDirection', type: "'right' | 'up' | 'down'", default: "'right'", desc: '箭头方向' },
  { prop: 'size', type: "'large' | ''", default: "''", desc: '单元格大小' },
  { prop: 'required', type: 'boolean', default: 'false', desc: '是否显示左侧必填星号' },
  { prop: 'center', type: 'boolean', default: 'false', desc: '是否使内容垂直居中' },
  { prop: 'url', type: 'string', default: '—', desc: '点击后跳转的页面路径' },
  { prop: 'titleNode', type: 'ReactNode', default: '—', desc: '自定义标题（源 title 插槽）' },
  { prop: 'valueNode', type: 'ReactNode', default: '—', desc: '自定义右侧内容（源 value 插槽）' },
  { prop: 'rightIconNode', type: 'ReactNode', default: '—', desc: '自定义右侧图标（源 right-icon 插槽）' },
  { prop: 'onClick', type: '(payload) => void', default: '—', desc: '点击单元格时触发' },
];

export default function CellDemo() {
  return (
    <DemoPage>
      <PageItem title="基础功能">
        <UPCellGroup>
          <UPCell isLink title="uview-plus" value="内容" />
          <UPCell label="挣脱束缚,向往自由" title="利剑出鞘,一统江湖" value="内容" />
        </UPCellGroup>
      </PageItem>

      <PageItem title="自定义图标/图片">
        <UPCellGroup>
          <UPCell icon="lock-fill" title="单元格" />
          <UPCell icon="https://uview-plus.jiangruyi.com/uview/example/tag.png" title="单元格" />
        </UPCellGroup>
      </PageItem>

      <PageItem title="自定义大小">
        <UPCellGroup>
          <UPCell isLink size="large" title="单元格" value="内容" />
          <UPCell label="描述信息" size="large" title="单元格" value="内容" />
        </UPCellGroup>
      </PageItem>

      <PageItem title="显示右箭头">
        <UPCellGroup>
          <UPCell isLink required title="单元格" value="组件" />
          <UPCell arrowDirection="up" isLink title="单元格" value="工具" />
          <UPCell arrowDirection="down" isLink title="单元格" value="模板" />
        </UPCellGroup>
      </PageItem>

      <PageItem title="跳转页面">
        <UPCellGroup>
          <UPCell isLink title="打开标签页" url="/pages/componentsB/tag/tag" />
          <UPCell isLink title="打开徽标页" url="/pages/componentsB/badge/badge" />
        </UPCellGroup>
      </PageItem>

      <PageItem title="右侧内容垂直居中">
        <UPCellGroup>
          <UPCell center label="描述信息" required title="单元格" value="内容" />
        </UPCellGroup>
      </PageItem>

      <PageItem title="自定义插槽">
        <UPCellGroup>
          <UPCell
            titleNode={
              <View style={s.slotTitle}>
                <Text style={s.cellText}>单元格</Text>
                <UPTag plain size="mini" text="标签" type="warning" />
              </View>
            }
            value="内容"
          />
          <UPCell
            isLink
            rightIconNode={<Text>1</Text>}
            title="单元格"
            valueNode={<Text style={s.slotValue}>99</Text>}
          />
        </UPCellGroup>
      </PageItem>

      <UPGap height={30} />

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  cellText: { color: '#303133', fontSize: 15, lineHeight: 22, marginRight: 5 },
  slotTitle: { alignItems: 'center', flexDirection: 'row' },
  slotValue: {
    backgroundColor: '#f56c6c',
    borderRadius: 100,
    color: '#FFFFFF',
    fontSize: 10,
    height: 17,
    lineHeight: 17,
    marginLeft: 'auto',
    paddingHorizontal: 5,
    textAlign: 'center',
  },
});
