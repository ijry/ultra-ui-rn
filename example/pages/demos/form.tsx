/**
 * 组件示例页 - 表单组件
 * 输入框、搜索、开关、复选框、单选框、选择器、滑块、评分
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  UPInput,
  UPSearch,
  UPSwitch,
  UPCheckbox,
  UPCheckboxGroup,
  UPRadio,
  UPRadioGroup,
  UPChoose,
  UPNumberBox,
  UPSlider,
  UPRate,
  UPCodeInput,
  UPCode,
  UPTextarea,
  UPButton,
  UPKeyboard,
  UPNumberKeyboard,
  UPCarKeyboard,
} from 'ultra-ui-rn';

export default function FormPage() {
  const [query, setQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [choices, setChoices] = useState<(string | number | boolean)[]>(['news']);
  const [chooseIndex, setChooseIndex] = useState(0);
  const [shipping, setShipping] = useState<string | number | boolean>('standard');
  const [quantity, setQuantity] = useState(1);
  const [sliderValue, setSliderValue] = useState(40);
  const [rateValue, setRateValue] = useState(3);
  const [code, setCode] = useState('');
  const [codePrompt, setCodePrompt] = useState('获取验证码');
  const [textareaValue, setTextareaValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>表单组件</Text>

      {/* 输入框 Input */}
      <Text style={styles.section}>输入框 Input</Text>
      <UPInput
        clearable
        placeholder="搜索文字"
        value={query}
        onChange={setQuery}
      />

      {/* 搜索 Search */}
      <Text style={styles.section}>搜索 Search</Text>
      <UPSearch
        actionText="搜索"
        onChange={setSearchValue}
        onClear={() => setSearchValue('')}
        onSearch={(value) => console.log('搜索:', value)}
        placeholder="搜索..."
        showAction
        value={searchValue}
      />
      <Text>搜索值: {searchValue || '—'}</Text>

      {/* 开关 Switch */}
      <Text style={styles.section}>开关 Switch</Text>
      <UPSwitch value={enabled} onChange={(value) => setEnabled(value === true)} />
      <Text>状态: {enabled ? '开启' : '关闭'}</Text>

      {/* 复选框 Checkbox */}
      <Text style={styles.section}>复选框 Checkbox</Text>
      <UPCheckboxGroup value={choices} onChange={setChoices}>
        <UPCheckbox label="新闻" name="news" />
        <UPCheckbox label="优惠" name="offers" />
      </UPCheckboxGroup>

      {/* 选择器 Choose */}
      <Text style={styles.section}>选择器 Choose</Text>
      <UPChoose
        modelValue={chooseIndex}
        options={[{ title: '每天' }, { title: '每周' }, { title: '每月' }]}
        onUpdateModelValue={setChooseIndex}
      />
      <Text>选中索引: {chooseIndex}</Text>

      {/* 单选框 Radio */}
      <Text style={styles.section}>单选框 Radio</Text>
      <UPRadioGroup value={shipping} onChange={setShipping}>
        <UPRadio label="标准配送" name="standard" />
        <UPRadio label="快递配送" name="express" />
      </UPRadioGroup>

      {/* 数字输入框 NumberBox */}
      <Text style={styles.section}>数字输入框 NumberBox</Text>
      <UPNumberBox max={9} min={1} value={quantity} onChange={setQuantity} />
      <Text>数量: {quantity}</Text>

      {/* 滑块 Slider */}
      <Text style={styles.section}>滑块 Slider</Text>
      <UPSlider max={100} min={0} step={5} value={sliderValue} onChange={setSliderValue} />
      <Text>滑块值: {sliderValue}</Text>

      {/* 评分 Rate */}
      <Text style={styles.section}>评分 Rate</Text>
      <UPRate count={5} value={rateValue} onChange={setRateValue} />
      <Text>评分: {rateValue}</Text>

      {/* 验证码输入 CodeInput */}
      <Text style={styles.section}>验证码输入 CodeInput</Text>
      <UPCodeInput maxlength={4} value={code} onChange={setCode} />

      {/* 验证码 Code */}
      <Text style={styles.section}>验证码 Code</Text>
      <UPButton text={codePrompt} onClick={() => {}} />
      <UPCode
        changeText="X秒后重新获取"
        endText="重新获取验证码"
        onChange={setCodePrompt}
        seconds={10}
        startText="获取验证码"
      />
      <Text>验证码: {code || '—'}</Text>

      {/* 多行输入 Textarea */}
      <Text style={styles.section}>多行输入 Textarea</Text>
      <UPTextarea
        count
        maxlength={60}
        onChange={setTextareaValue}
        placeholder="输入反馈..."
        value={textareaValue}
      />
      <Text>字数: {textareaValue.length}</Text>

      {/* 数字键盘 NumberKeyboard */}
      <Text style={styles.section}>数字键盘 NumberKeyboard</Text>
      <UPButton text="打开数字键盘" onClick={() => setKeyboardOpen(true)} />
      <UPKeyboard
        mode="number"
        onBackspace={() => setNumberValue((v) => v.slice(0, -1))}
        onChange={(value) => setNumberValue((current) => `${current}${value}`)}
        onChangeShow={setKeyboardOpen}
        onConfirm={() => setKeyboardOpen(false)}
        show={keyboardOpen}
        tips="请输入金额"
      />
      <Text>键盘值: {numberValue || '—'}</Text>

      {/* 车牌键盘 CarKeyboard */}
      <Text style={styles.section}>车牌键盘 CarKeyboard</Text>
      <UPCarKeyboard
        onBackspace={() => setCarPlate((v) => v.slice(0, -1))}
        onChange={(value) => setCarPlate((current) => `${current}${value}`)}
      />
      <Text>车牌: {carPlate || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  section: {
    color: '#606266',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    color: '#303133',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
