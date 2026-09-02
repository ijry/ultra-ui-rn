/**
 * Keyboard 键盘
 * 严格复刻 uview-plus pages/componentsB/keyboard/keyboard.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  UPCell,
  UPCellGroup,
  UPGap,
  UPKeyboard,
  type UPKeyboardMode,
  type UPKeyboardValue,
} from 'ultra-ui-rn';

type KeyData = {
  mode: UPKeyboardMode;
  dotDisabled: boolean;
  random: boolean;
};

const list = [
  { title: '车牌号键盘', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/keyboard/car.png' },
  { title: '数字键盘', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/keyboard/number.png' },
  { title: '身份证键盘', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/keyboard/IdCard.png' },
  { title: '隐藏键盘"."符号', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/keyboard/dot.png' },
  { title: '打乱键盘按键的顺序', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/keyboard/order.png' },
];

const KEY_DATA: readonly KeyData[] = [
  { mode: 'car', dotDisabled: false, random: false },
  { mode: 'number', dotDisabled: false, random: false },
  { mode: 'card', dotDisabled: false, random: false },
  { mode: 'number', dotDisabled: true, random: false },
  { mode: 'number', dotDisabled: false, random: true },
];

export default function KeyboardDemo() {
  const [keyData, setKeyData] = useState<KeyData>(KEY_DATA[1]!);
  const [show, setShow] = useState(false);
  const [, setInput] = useState('');

  const openKeyboard = (indexNum: number) => {
    setKeyData(KEY_DATA[indexNum] ?? KEY_DATA[1]!);
    setInput('');
    setShow(true);
  };

  const change = (value: UPKeyboardValue) => {
    setInput((prev) => prev + String(value));
  };

  const backspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.page}>
      <UPGap height={20} />
      <UPCellGroup>
        {list.map((item, index) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={styles.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => openKeyboard(index)}
            title={item.title}
            titleStyle={styles.cellTitle}
          />
        ))}
      </UPCellGroup>
      <UPKeyboard
        dotDisabled={keyData.dotDisabled}
        mode={keyData.mode}
        onBackspace={backspace}
        onCancel={() => setShow(false)}
        onChange={change}
        onClose={() => setShow(false)}
        onConfirm={() => setShow(false)}
        random={keyData.random}
        show={show}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 0 },
  cellIcon: { width: 30, height: 30, marginRight: 8 },
  cellTitle: { fontWeight: '500' },
});
