/**
 * Select 列选择器
 * 严格复刻 uview-plus pages/componentsD/select/select.vue
 */
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { UPSelect, type UPSelectOption } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const scenesList = [
  { id: '1', name: '分类1' },
  { id: '2', name: '分类2' },
  { id: '3', name: '分类4' },
];

const PROPS = [
  { prop: 'label', type: 'string', default: "'选项'", desc: '未选中时展示的标题' },
  { prop: 'options', type: 'Array<Record<string, unknown>>', default: '[]', desc: '选项列表' },
  { prop: 'keyName', type: 'string', default: "'id'", desc: '选项的值字段名' },
  { prop: 'labelName', type: 'string', default: "'name'", desc: '选项的文字字段名' },
  { prop: 'showOptionsLabel', type: 'boolean', default: 'false', desc: '是否用选中项的文字替代 label' },
  { prop: 'current', type: 'string | number', default: "''", desc: '当前选中项的值' },
  { prop: 'maxHeight', type: 'number | string', default: "'90vh'", desc: '下拉菜单最大高度' },
  { prop: 'optionsWidth', type: 'number | string', default: "''", desc: '下拉菜单宽度，支持百分比' },
  { prop: 'border', type: 'boolean', default: 'false', desc: '是否显示触发器边框' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'overlay', type: 'boolean', default: 'true', desc: '是否显示遮罩' },
  { prop: 'overlayOpacity', type: 'number', default: '0.01', desc: '遮罩透明度' },
  { prop: 'itemColor', type: 'string', default: "''", desc: '选项文字颜色' },
  { prop: 'iconColor', type: 'string', default: "''", desc: '右侧箭头颜色' },
  { prop: 'iconSize', type: 'number | string', default: "'13px'", desc: '右侧箭头大小' },
  { prop: 'zIndex', type: 'number', default: '11000', desc: '下拉菜单层级' },
  { prop: 'renderOption', type: '(item, index) => ReactNode', default: '—', desc: '自定义单个选项（源 optionItem 插槽）' },
  { prop: 'renderOptions', type: '() => ReactNode', default: '—', desc: '自定义整个下拉内容（源 options 插槽）' },
  { prop: 'renderText', type: '(currentLabel) => ReactNode', default: '—', desc: '自定义触发器文字' },
  { prop: 'icon', type: 'ReactNode', default: '—', desc: '自定义右侧图标' },
  { prop: 'onSelect', type: '(item) => void', default: '—', desc: '选中某项时触发，回传原始选项' },
  { prop: 'onUpdateCurrent', type: '(current) => void', default: '—', desc: '选中某项时回传其 keyName 值' },
];

export default function SelectDemo() {
  const [cateId, setCateId] = useState<string | number>('');
  const [pcSelectId, setPcSelectId] = useState<string | number>('');

  return (
    <DemoPage>
      {/* 未选中时本地 showOptionsLabel 会渲染空文字，不会回退到 label。 */}
      <PageItem title="默认">
        <UPSelect
          current={cateId}
          label="分类"
          onUpdateCurrent={(value) => setCateId(value ?? '')}
          options={scenesList}
          showOptionsLabel
        />
      </PageItem>

      <PageItem title="插槽">
        <UPSelect
          current={cateId}
          label="分类"
          onUpdateCurrent={(value) => setCateId(value ?? '')}
          options={scenesList}
          renderOption={(item: UPSelectOption) => (
            <Text style={s.itemText}>{String(item.name ?? '')}</Text>
          )}
          showOptionsLabel
        />
      </PageItem>

      <PageItem title="边框与下拉宽度">
        <UPSelect
          border
          current={pcSelectId}
          label="请选择分类"
          onUpdateCurrent={(value) => setPcSelectId(value ?? '')}
          options={scenesList}
          optionsWidth="100%"
          showOptionsLabel
        />
      </PageItem>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  itemText: { color: '#303133', fontSize: 14 },
});
