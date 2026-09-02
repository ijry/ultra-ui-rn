/**
 * Slider 滑动选择器
 * 严格复刻 uview-plus pages/componentsB/slider/slider.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPButton, UPModal, UPPopup, UPSlider, UPText } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'number | string', default: '0', desc: '滑块选择值（v-model）' },
  { prop: 'rangeValue', type: '[number, number]', default: '—', desc: '区间选择的双滑块值' },
  { prop: 'isRange', type: 'boolean', default: 'false', desc: '是否开启区间选择' },
  { prop: 'min', type: 'number | string', default: '0', desc: '可选最小值' },
  { prop: 'max', type: 'number | string', default: '100', desc: '可选最大值' },
  { prop: 'step', type: 'number | string', default: '1', desc: '选择步长' },
  { prop: 'blockSize', type: 'number | string', default: '18', desc: '滑块宽高' },
  { prop: 'blockColor', type: 'string', default: '#ffffff', desc: '滑块颜色' },
  { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '已选择部分的颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#c0c4cc', desc: '未选择部分的颜色' },
  { prop: 'height', type: 'number | string', default: '2px', desc: '滑块条高度' },
  { prop: 'showValue', type: 'boolean', default: 'false', desc: '是否显示当前值' },
  { prop: 'vertical', type: 'boolean', default: 'false', desc: '是否垂直方向' },
  { prop: 'length', type: 'number | string', default: '—', desc: '垂直方向时的轨道长度' },
  { prop: 'onChange', type: '(value: number) => void', default: '—', desc: '松开滑块时触发' },
  { prop: 'onChanging', type: '(value: number) => void', default: '—', desc: '拖动滑块过程中触发' },
];

export default function SliderDemo() {
  const [modelShow, setModelShow] = useState(false);
  const [popupShow, setPopupShow] = useState(false);
  const [sliderValue, setSliderValue] = useState(4);
  const [value1, setValue1] = useState(30);
  const [value2, setValue2] = useState(30);
  const [value3, setValue3] = useState(0.3);
  const [value4, setValue4] = useState(30);
  const [value5, setValue5] = useState(30);
  const [value6, setValue6] = useState<[number, number]>([10, 20]);
  const [value7, setValue7] = useState(50);
  const [value8] = useState<[number, number]>([20, 80]);
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage>
      <Section title="基本案例">
        <View style={s.item}>
          <UPSlider onChange={setValue1} useNative={false} value={value1} />
        </View>
        <UPButton onClick={() => setValue1((prev) => prev + 1)} text="前进" />
      </Section>

      <Section title="自定义范围(10—50)">
        <View style={s.item}>
          <UPSlider max="50" min="10" onChange={setValue2} showValue useNative={false} value={value2} />
        </View>
      </Section>

      <Section title="指定步长(每次步进5)">
        <View style={s.item}>
          <UPSlider onChange={setValue4} step={5} useNative={false} value={value4} />
        </View>
      </Section>

      <Section title="小数步长(每次步进0.1)">
        <View style={s.item}>
          <UPSlider max={1} min={0} onChange={setValue3} showValue step={0.1} value={value3} />
        </View>
      </Section>

      <Section title="自定义样式">
        <View style={s.item}>
          <UPSlider
            activeColor="#deab8a"
            blockColor="#f47920"
            height="20px"
            onChange={setValue5}
            value={value5}
          />
        </View>
      </Section>

      <Section title="区间选择(双滑块)">
        <View style={s.item}>
          <UPSlider
            height="2px"
            isRange
            onChange={(next) => setValue6([next, value6[1]])}
            rangeValue={value6}
            showValue
            step="2"
          />
        </View>
      </Section>

      <Section title="垂直方向">
        <View style={s.item}>
          <UPSlider length="200px" onChange={setValue7} size="2px" value={value7} vertical />
        </View>
      </Section>

      <Section title="垂直方向区间选择">
        <View style={s.item}>
          <UPSlider isRange length="200px" rangeValue={value8} size="2px" vertical />
        </View>
      </Section>

      <Section title="在Modal弹窗中使用">
        <View style={s.item}>
          <UPText onClick={() => setModelShow(true)} text="打开弹窗" />
          <UPModal onChangeShow={setModelShow} show={modelShow}>
            <View style={s.slotContent}>
              {modelShow ? (
                <UPSlider max="4" min="1" onChange={setSliderValue} showValue value={sliderValue} />
              ) : null}
            </View>
          </UPModal>
        </View>
      </Section>

      <Section title="在popup弹窗中使用">
        <View style={s.item}>
          <UPText onClick={() => setPopupShow(true)} text="打开弹窗" />
          <UPPopup onChangeShow={setPopupShow} show={popupShow}>
            <View style={s.slotContent}>
              {popupShow ? (
                <UPSlider max="4" min="1" onChange={setSliderValue} showValue value={sliderValue} />
              ) : null}
            </View>
          </UPPopup>
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { marginBottom: 8 },
  slotContent: { width: '100%' },
});
