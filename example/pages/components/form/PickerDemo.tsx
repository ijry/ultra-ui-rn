/**
 * Picker 选择器
 * 严格复刻 uview-plus pages/componentsC/picker/picker.nvue
 */
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  UPCell,
  UPCellGroup,
  UPPicker,
  type UPPickerChangePayload,
  type UPPickerRef,
} from 'ultra-ui-rn';

const columnData = [
  ['深圳', '厦门', '上海', '拉萨'],
  ['得州', '华盛顿', '纽约', '阿拉斯加'],
];

const list = [
  { title: '基础使用', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/picker/2.png' },
  { title: '设置默认项', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/picker/5.png' },
  { title: '多列联动', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/picker/1.png' },
  { title: '加载中状态(切换第一列)', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/picker/3.png' },
  { title: '设置标题', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/picker/4.png' },
  { title: '允许点击遮罩关闭', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/picker/6.png' },
];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function PickerDemo() {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [columns1, setColumns1] = useState([['中国', '美国', '日本']]);
  const [show5value, setShow5value] = useState<string[]>(['日本']);

  const picker3 = useRef<UPPickerRef>(null);
  const picker4 = useRef<UPPickerRef>(null);

  // Upstream mutates columns1 from onLoad after 3s to prove late column updates work.
  useEffect(() => {
    const timer = setTimeout(() => {
      setColumns1([['中国onLoad', '美国onLoad', '日本onLoad']]);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const change = (e: UPPickerChangePayload) => {
    console.log('change', e);
  };

  const close = () => setActive(0);

  const changeHandler1 = (e: UPPickerChangePayload) => {
    change(e);
    if (e.columnIndex === 0) {
      picker3.current?.setColumnValues(1, columnData[e.index] ?? []);
    }
  };

  const changeHandler2 = (e: UPPickerChangePayload) => {
    change(e);
    if (e.columnIndex === 0) {
      setLoading(true);
      void sleep(1500).then(() => {
        picker4.current?.setColumnValues(1, columnData[e.index] ?? []);
        setLoading(false);
      });
    }
  };

  return (
    <View style={styles.page}>
      <UPCellGroup>
        {list.map((item, index) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={styles.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => setActive(index + 1)}
            title={item.title}
            valueNode={index === 4 ? <Text>{show5value.join('|')}</Text> : undefined}
          />
        ))}
      </UPCellGroup>

      <UPPicker
        columns={columns1}
        onCancel={close}
        onChange={change}
        onConfirm={close}
        show={active === 1}
        toolbarRight={<View style={styles.toolbarRight}><Text>右侧</Text></View>}
        toolbarRightSlot
      />
      <UPPicker
        columns={[['中国', '美国', '日本']]}
        defaultIndex={[1]}
        onCancel={close}
        onChange={change}
        onConfirm={close}
        show={active === 2}
      />
      <UPPicker
        columns={[['中国', '美国'], ['深圳', '厦门', '上海', '拉萨']]}
        onCancel={close}
        onChange={changeHandler1}
        onConfirm={close}
        ref={picker3}
        show={active === 3}
      />
      <UPPicker
        columns={[['中国', '美国'], ['深圳', '厦门', '上海', '拉萨']]}
        loading={loading}
        onCancel={close}
        onChange={changeHandler2}
        onConfirm={close}
        ref={picker4}
        show={active === 4}
      />
      <UPPicker
        columns={[['中国', '美国', '日本']]}
        modelValue={show5value}
        onCancel={close}
        onChange={change}
        onConfirm={close}
        onUpdateModelValue={(values) => setShow5value(values.map(String))}
        show={active === 5}
        title="标题太长就会显示省略号"
      />
      <UPPicker
        closeOnClickOverlay
        columns={[['中国', '美国', '日本']]}
        onChange={change}
        onChangeShow={(next) => { if (!next) close(); }}
        show={active === 6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cellIcon: { height: 30, marginRight: 8, width: 30 },
  page: { flex: 1, padding: 0 },
  toolbarRight: { paddingRight: 10 },
});
