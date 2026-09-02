/**
 * NumberBox 步进器
 * 严格复刻 uview-plus pages/componentsB/numberBox/numberBox.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPCell, UPCellGroup, UPIcon, UPNumberBox, toast } from 'ultra-ui-rn';

export default function NumberBoxDemo() {
  const [value1, setValue1] = useState(3);
  const [value2, setValue2] = useState(3);
  const [value3, setValue3] = useState(3);
  const [value4, setValue4] = useState(3);
  const [value5] = useState(3);
  const [value6, setValue6] = useState(3);
  const [value7, setValue7] = useState(3);
  const [value8, setValue8] = useState(3.1);
  const [value9, setValue9] = useState(3);
  const [value10, setValue10] = useState(3);
  const [value11, setValue11] = useState(3);
  const [asyncChange, setAsyncChange] = useState(true);

  const change = (e: number) => {
    console.log('change', e);
  };

  const myAsyncChange = (e: number) => {
    setAsyncChange(false);
    toast.loading('正在加载');
    setTimeout(() => {
      toast.hide();
      setValue9(e);
      setAsyncChange(true);
    }, 3000);
  };

  return (
    <View>
      <UPCellGroup border>
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              onChange={(next) => { setValue1(next); change(next); }}
              step="1"
              value={value1}
            />
          }
          title="基础用法"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              onChange={(next) => { setValue2(next); change(next); }}
              step={2}
              value={value2}
            />
          }
          title="步长设置"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              max={8}
              min={5}
              onChange={(next) => { setValue3(next); change(next); }}
              step="1"
              value={value3}
            />
          }
          title="限制输入范围"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              integer
              onChange={(next) => { setValue4(next); change(next); }}
              step="1"
              value={value4}
            />
          }
          title="限制输入整数"
        />
        <UPCell
          border
          rightIconNode={<UPNumberBox disabled onChange={change} step="1" value={value5} />}
          title="禁用状态"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              disabledInput
              onChange={(next) => { setValue6(next); change(next); }}
              step="1"
              value={value6}
            />
          }
          title="禁用输入框"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              longPress={false}
              onChange={(next) => { setValue7(next); change(next); }}
              step="1"
              value={value7}
            />
          }
          title="禁用长按"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              decimalLength="1"
              onChange={(next) => { setValue8(next); change(next); }}
              step="0.2"
              value={value8}
            />
          }
          title="固定小数位数"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              asyncChange={asyncChange}
              onChange={myAsyncChange}
              step="1"
              value={value9}
            />
          }
          title="异步变更"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              bgColor="#2979ff"
              buttonSize={36}
              color="#FFFFFF"
              iconStyle={styles.customIcon}
              onChange={(next) => { setValue10(next); change(next); }}
              step="1"
              value={value10}
            />
          }
          title="自定义大小颜色样式"
        />
        <UPCell
          border
          rightIconNode={
            <UPNumberBox
              inputNode={<Text style={styles.input}>{value11}</Text>}
              min={0}
              minusNode={
                <View style={styles.minus}>
                  <UPIcon name="minus" size={12} />
                </View>
              }
              onChange={setValue11}
              plusNode={
                <View style={styles.plus}>
                  <UPIcon color="#FFFFFF" name="plus" size={12} />
                </View>
              }
              showMinus={value11 > 0}
              step="1"
              value={value11}
            />
          }
          title="自定义(为0时减少按钮会消失)"
        />
      </UPCellGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  customIcon: { color: '#fff' },
  input: { paddingHorizontal: 10, textAlign: 'center', width: 50 },
  minus: {
    alignItems: 'center',
    borderColor: '#E6E6E6',
    borderRadius: 100,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  plus: {
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
});
