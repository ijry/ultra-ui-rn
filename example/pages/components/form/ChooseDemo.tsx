/**
 * Choose 选择
 * 严格复刻 uview-plus pages/componentsD/choose/choose.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPCateTab, UPChoose } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'options', type: 'ChooseOption[]', default: '[]', desc: '选项列表' },
  { prop: 'modelValue', type: 'number | string | unknown[] | false', default: 'false', desc: '当前选中项索引（v-model）' },
  { prop: 'type', type: 'string', default: "'radio'", desc: '选择类型' },
  { prop: 'itemWidth', type: 'number | string', default: "'auto'", desc: '选项宽度' },
  { prop: 'itemHeight', type: 'number | string', default: "'50px'", desc: '选项高度' },
  { prop: 'itemPadding', type: 'number | string', default: "'8px'", desc: '选项内边距' },
  { prop: 'labelName', type: 'string', default: "'title'", desc: '选项文字的字段名' },
  { prop: 'valueName', type: 'string', default: "'value'", desc: '选项值的字段名' },
  { prop: 'wrap', type: 'boolean', default: 'true', desc: '是否自动换行' },
  { prop: 'customClick', type: 'boolean', default: 'false', desc: '是否由外部接管点击' },
  { prop: 'onUpdateModelValue', type: '(index: number) => void', default: '—', desc: '选中项变化时触发' },
];

const options1 = [
  { id: 1, title: '选项1' },
  { id: 2, title: '选项2' },
  { id: 3, title: '选项3' },
  { id: 4, title: '选项4' },
  { id: 5, title: '选项5' },
  { id: 6, title: '选项6' },
];

const options2 = [
  { id: 1, title: '选项A' },
  { id: 2, title: '选项B' },
  { id: 3, title: '选项C' },
  { id: 4, title: '选项D' },
  { id: 5, title: '选项E' },
  { id: 6, title: '选项F' },
];

const options3 = [
  { id: 1, title: '9:00-10:00' },
  { id: 2, title: '10:00-11:00' },
  { id: 3, title: '11:00-12:00' },
  { id: 4, title: '12:00-13:00' },
  { id: 5, title: '13:00-14:00' },
  { id: 6, title: '14:00-15:00' },
  { id: 7, title: '15:00-16:00' },
  { id: 8, title: '16:00-17:00' },
];

const options4 = [
  { id: 1, title: '较宽选项1' },
  { id: 2, title: '较宽选项2' },
  { id: 3, title: '较宽选项3' },
];

const deliveryTimes = [
  { id: 1, title: '9:00-10:00' },
  { id: 2, title: '10:00-11:00' },
  { id: 3, title: '11:00-12:00' },
  { id: 4, title: '12:00-13:00' },
  { id: 5, title: '13:00-14:00' },
  { id: 6, title: '14:00-15:00' },
  { id: 7, title: '15:00-16:00' },
  { id: 8, title: '16:00-17:00' },
  { id: 9, title: '17:00-18:00' },
  { id: 10, title: '18:00-19:00' },
  { id: 11, title: '19:00-20:00' },
  { id: 12, title: '20:00-21:00' },
];

const deliveryOptions = [
  { name: '今天', times: deliveryTimes },
  { name: '明天', times: deliveryTimes },
  { name: '后天', times: deliveryTimes },
];

export default function ChooseDemo() {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(1);
  const [value5, setValue5] = useState(0);
  const [deliveryCurrent, setDeliveryCurrent] = useState(0);
  const [deliverySelected, setDeliverySelected] = useState<number[]>([0, 0, 0]);
  const [events, setEvents] = useState<string[]>([]);

  const onDeliveryTimeChange = (tabIndex: number, index: number) => {
    setDeliverySelected((prev) => prev.map((item, i) => (i === tabIndex ? index : item)));
    setEvents((prev) => [...prev, `选择的时间索引: ${index}`]);
  };

  return (
    <DemoPage>
      <Section title="基本用法">
        <UPChoose modelValue={value1} onUpdateModelValue={setValue1} options={options1} />
      </Section>

      <Section title="不换行显示">
        <UPChoose
          modelValue={value2}
          onUpdateModelValue={setValue2}
          options={options2}
          wrap={false}
        />
      </Section>

      <Section title="时间选择">
        <UPChoose
          itemHeight="35px"
          itemWidth="170px"
          modelValue={value5}
          onUpdateModelValue={setValue5}
          options={options3}
        />
      </Section>

      <Section title="快递上门时间预约">
        <UPCateTab
          current={deliveryCurrent}
          height="300px"
          mode="tab"
          onUpdateCurrent={setDeliveryCurrent}
          renderItemList={({ item, index }) => (
            <View style={s.deliveryContainer}>
              <View style={s.itemTitle}>
                <Text style={s.itemTitleText}>{String(item.name ?? '')}</Text>
              </View>
              <View style={s.itemContainer}>
                <UPChoose
                  itemHeight="30px"
                  itemWidth="230px"
                  modelValue={deliverySelected[index] ?? 0}
                  onUpdateModelValue={(next) => onDeliveryTimeChange(index, next)}
                  options={deliveryTimes}
                />
              </View>
            </View>
          )}
          tabList={deliveryOptions}
        />
      </Section>

      <Section title="自定义尺寸">
        <UPChoose
          itemHeight="110px"
          itemWidth="125px"
          modelValue={value5}
          onUpdateModelValue={setValue5}
          options={options4}
          wrap={false}
        />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  deliveryContainer: { paddingVertical: 5 },
  itemContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  itemTitle: { marginBottom: 10 },
  itemTitleText: { color: '#606266', fontSize: 14 },
});
