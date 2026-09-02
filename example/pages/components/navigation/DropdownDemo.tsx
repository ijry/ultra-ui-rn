/**
 * Dropdown 下拉菜单
 * 严格复刻 uview-plus pages/componentsB/dropdown/dropdown.nvue
 */
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  UPButton,
  UPDropdown,
  UPDropdownItem,
  toast,
  type UPDropdownRef,
  type UPDropdownValue,
} from 'ultra-ui-rn';
import { DemoPage, ParamPanel, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '标题和选项的激活色' },
  { prop: 'inactiveColor', type: 'string', default: '#606266', desc: '标题和选项的未激活色' },
  { prop: 'closeOnClickMask', type: 'boolean', default: 'true', desc: '点击遮罩是否关闭菜单' },
  { prop: 'closeOnClickSelf', type: 'boolean', default: 'true', desc: '点击当前标题是否关闭菜单' },
  { prop: 'borderBottom', type: 'boolean', default: 'false', desc: '标题栏是否显示下边框' },
  { prop: 'height', type: 'number | string', default: '40', desc: '标题栏高度' },
  { prop: 'menuIcon', type: 'string', default: "'arrow-down-fill'", desc: '标题右侧图标' },
  { prop: 'onOpen', type: '(index) => void', default: '—', desc: '下拉菜单展开时触发' },
  { prop: 'onClose', type: '(index) => void', default: '—', desc: '下拉菜单收起时触发' },
];

const options1 = [
  { label: '默认排序', value: 1 },
  { label: '距离优先', value: 2 },
  { label: '价格优先', value: 3 },
];

const options2 = [
  { label: '去冰', value: 1 },
  { label: '加冰', value: 2 },
  { label: '正常温', value: 3 },
  { label: '加热', value: 4 },
  { label: '极寒风暴', value: 5 },
];

const ACTIVE_COLORS = ['#2979ff', '#ff9900', '#19be6b'];

export default function DropdownDemo() {
  const dropdown = useRef<UPDropdownRef>(null);
  const [value1, setValue1] = useState<UPDropdownValue>('');
  const [value2, setValue2] = useState<UPDropdownValue>('2');
  const [mask, setMask] = useState(true);
  const [borderBottom, setBorderBottom] = useState(false);
  const [activeColor, setActiveColor] = useState(ACTIVE_COLORS[0]!);
  const [list, setList] = useState([
    { label: '琪花瑶草', active: true },
    { label: '清词丽句', active: false },
    { label: '宛转蛾眉', active: false },
    { label: '煦色韶光', active: false },
    { label: '鱼沉雁落', active: false },
    { label: '章台杨柳', active: false },
    { label: '霞光万道', active: false },
  ]);

  const change = (value: UPDropdownValue) => toast.default(`点击了第${String(value)}项`);

  const tagClick = (index: number) => {
    setList((prev) => prev.map((item, i) => (i === index ? { ...item, active: !item.active } : item)));
  };

  return (
    <DemoPage>
      <View style={s.demoArea}>
        <UPDropdown
          activeColor={activeColor}
          borderBottom={borderBottom}
          closeOnClickMask={mask}
          ref={dropdown}
        >
          <UPDropdownItem
            onChange={change}
            onUpdateModelValue={setValue1}
            options={options1}
            title="距离"
            value={value1}
          />
          <UPDropdownItem
            onChange={change}
            onUpdateModelValue={setValue2}
            options={options2}
            title="温度"
            value={value2}
          />
          <UPDropdownItem title="属性">
            <View style={s.slotContent}>
              <View style={s.itemBox}>
                {list.map((item, index) => (
                  <Pressable
                    key={item.label}
                    onPress={() => tagClick(index)}
                    style={[s.item, item.active ? s.itemActive : null]}
                  >
                    <Text style={item.active ? s.itemTextActive : s.itemText}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
              <UPButton onClick={() => dropdown.current?.close()} text="确定" type="primary" />
            </View>
          </UPDropdownItem>
        </UPDropdown>
      </View>

      <View style={s.configWrap}>
        <Text style={s.blockTitle}>参数配置</Text>

        <ParamPanel
          current={borderBottom ? 0 : 1}
          label="下边框"
          onChange={(index) => setBorderBottom(index === 0)}
          options={['有', '无']}
        />

        <ParamPanel
          current={ACTIVE_COLORS.indexOf(activeColor)}
          label="激活颜色"
          onChange={(index) => setActiveColor(ACTIVE_COLORS[index] ?? ACTIVE_COLORS[0]!)}
          options={ACTIVE_COLORS}
        />

        <ParamPanel
          current={mask ? 0 : 1}
          label="遮罩是否可点击"
          onChange={(index) => setMask(index === 0)}
          options={['是', '否']}
        />
      </View>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  blockTitle: { color: '#909193', fontSize: 14, marginBottom: 8 },
  configWrap: { padding: 20 },
  demoArea: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  item: {
    borderColor: '#2979ff',
    borderRadius: 50,
    borderWidth: 1,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  itemActive: { backgroundColor: '#2979ff' },
  itemBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  itemText: { color: '#2979ff' },
  itemTextActive: { color: '#FFFFFF' },
  slotContent: { backgroundColor: '#FFFFFF', padding: 12 },
});
