/**
 * ColorPicker 颜色选择器
 * 严格复刻 uview-plus pages/componentsD/colorPicker/colorPicker.nvue
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UPColorPicker } from 'ultra-ui-rn';
import { DemoPage } from '../_shared';

export default function ColorPickerDemo() {
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [selectedColor2, setSelectedColor2] = useState('#00ff00');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showColorPickerWithCommon, setShowColorPickerWithCommon] = useState(false);

  const commonColors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#00ffff',
    '#ff00ff',
    '#ffffff',
    '#000000',
  ];

  const confirmColor = (color: string) => {
    setSelectedColor(color);
  };

  const confirmColor2 = (color: string) => {
    setSelectedColor2(color);
  };

  return (
    <DemoPage>
      <View style={s.card}>
        <Text style={s.title}>颜色选择器示例</Text>
        <Pressable onPress={() => setShowColorPicker(true)}>
          <View style={s.colorPreview}>
            <View style={[s.colorBlock, { backgroundColor: selectedColor }]} />
            <Text style={s.colorText}>{selectedColor}</Text>
          </View>
        </Pressable>
        <UPColorPicker
          onClose={() => setShowColorPicker(false)}
          onConfirm={confirmColor}
          show={showColorPicker}
          value={selectedColor}
        />
        <Text style={s.desc}>点击上方色块选择颜色</Text>
      </View>

      <View style={s.card}>
        <Text style={s.title}>带常用颜色的示例</Text>
        <Pressable onPress={() => setShowColorPickerWithCommon(true)}>
          <View style={s.colorPreview}>
            <View style={[s.colorBlock, { backgroundColor: selectedColor2 }]} />
            <Text style={s.colorText}>{selectedColor2}</Text>
          </View>
        </Pressable>
        <UPColorPicker
          commonColors={commonColors}
          onClose={() => setShowColorPickerWithCommon(false)}
          onConfirm={confirmColor2}
          show={showColorPickerWithCommon}
          value={selectedColor2}
        />
        <Text style={s.desc}>包含常用颜色选项</Text>
      </View>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
  },
  colorBlock: {
    borderColor: '#eee',
    borderRadius: 6,
    borderWidth: 1,
    height: 40,
    marginRight: 15,
    width: 40,
  },
  colorPreview: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    flexDirection: 'row',
    padding: 15,
  },
  colorText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
  },
  desc: {
    color: '#999',
    fontSize: 12,
    marginTop: 10,
  },
  title: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});
