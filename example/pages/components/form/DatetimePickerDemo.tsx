/**
 * DatetimePicker 时间日期选择器
 * 严格复刻 uview-plus pages/componentsC/datetimePicker/datetimePicker.nvue
 */
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  UPCell,
  UPCellGroup,
  UPDatetimePicker,
  UPForm,
  UPFormItem,
  UPInput,
  padZero,
  timeFormat,
  toast,
  type UPDatetimePickerColumnType,
  type UPDatetimePickerMode,
  type UPDatetimePickerPayload,
  type UPDatetimePickerValue,
} from 'ultra-ui-rn';

const list = [
  { title: '完整日期时间', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/6.png' },
  { title: '年月日', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/4.png' },
  { title: '年月', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/3.png' },
  { title: '时间', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/5.png' },
  { title: '过滤器(保留偶数年)', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/2.png' },
  { title: '格式化', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/1.png' },
  { title: '限制最大最小值', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/7.png' },
  { title: '只能选当前时间之后(动态minMinute)', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/datetime-picker/5.png' },
];

const filter = (mode: UPDatetimePickerColumnType, options: readonly string[]) =>
  mode === 'year' ? options.filter((option) => Number(option) % 2 === 0) : options;

const formatter = (type: UPDatetimePickerColumnType, value: string) => {
  if (type === 'year') return `${value}年`;
  if (type === 'month') return `${value}月`;
  if (type === 'day') return `${value}日`;
  return value;
};

const result = (time: UPDatetimePickerValue, mode: UPDatetimePickerMode) => {
  if (mode === 'datetime') return toast.default(timeFormat(time, 'yyyy-mm-dd hh:MM'));
  if (mode === 'date') return toast.default(timeFormat(time, 'yyyy-mm-dd'));
  if (mode === 'year-month') return toast.default(timeFormat(time, 'yyyy-mm'));
  if (mode === 'time') return toast.default(String(time));
  return undefined;
};

export default function DatetimePickerDemo() {
  const now = useRef(new Date()).current;
  const [active, setActive] = useState(0);
  const [value1, setValue1] = useState<UPDatetimePickerValue>(Number(new Date()));
  const [value2, setValue2] = useState<UPDatetimePickerValue>(Number(new Date()));
  const [value3, setValue3] = useState<UPDatetimePickerValue>(Number(new Date()));
  const [value4, setValue4] = useState<UPDatetimePickerValue>('05:28');
  const [value5, setValue5] = useState<UPDatetimePickerValue>(Number(new Date()));
  const [value6, setValue6] = useState<UPDatetimePickerValue>(Number(new Date()));
  const [value7, setValue7] = useState<UPDatetimePickerValue>(Number(new Date()));
  const [value8, setValue8] = useState<UPDatetimePickerValue>(
    `${padZero(now.getHours())}:${padZero(now.getMinutes())}`,
  );
  const [minMinute8, setMinMinute8] = useState(now.getMinutes());

  const close = () => setActive(0);

  const confirm = (payload: UPDatetimePickerPayload) => {
    close();
    result(payload.value, payload.mode);
  };

  // Upstream keeps minMinute in sync with the selected hour so that only
  // times at or after "now" remain selectable.
  const changeTime8 = (payload: UPDatetimePickerPayload) => {
    const hour = Number.parseInt(String(payload.value).split(':')[0] ?? '0', 10);
    setMinMinute8(hour <= now.getHours() ? now.getMinutes() : 0);
  };

  return (
    <View style={s.page}>
      <UPCellGroup>
        {list.map((item, index) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => setActive(index + 1)}
            title={item.title}
          />
        ))}
      </UPCellGroup>

      <View style={s.formWrap}>
        <UPForm labelPosition="left">
          <UPFormItem borderBottom label="姓名" prop="userInfo.name">
            <UPInput />
          </UPFormItem>
          <UPFormItem borderBottom label="页面">
            <UPDatetimePicker
              hasInput
              inputProps={{
                border: 'surround',
                inputAlign: 'center',
                shape: 'square',
                suffixIcon: 'calendar',
              }}
              mode="datetime"
              modelValue={1714266792000}
              placeholder="请选择日期"
            />
          </UPFormItem>
          <UPFormItem borderBottom label="日期">
            <UPDatetimePicker
              mode="datetime"
              modelValue={1714266792000}
              pageInline
              showToolbar={false}
            />
          </UPFormItem>
        </UPForm>
      </View>

      <UPDatetimePicker
        closeOnClickOverlay
        mode="datetime"
        modelValue={value1}
        onCancel={close}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue1}
        show={active === 1}
        toolbarRight={<Text style={s.toolbarRight}>右侧</Text>}
        toolbarRightSlot
      />
      <UPDatetimePicker
        closeOnClickOverlay
        mode="date"
        modelValue={value2}
        onCancel={close}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue2}
        show={active === 2}
      />
      <UPDatetimePicker
        closeOnClickOverlay
        mode="year-month"
        modelValue={value3}
        onCancel={close}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue3}
        show={active === 3}
      />
      <UPDatetimePicker
        closeOnClickOverlay
        mode="time"
        modelValue={value4}
        onCancel={close}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue4}
        show={active === 4}
      />
      <UPDatetimePicker
        closeOnClickOverlay
        filter={filter}
        mode="date"
        modelValue={value5}
        onCancel={close}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue5}
        show={active === 5}
      />
      <UPDatetimePicker
        closeOnClickOverlay
        formatter={formatter}
        mode="date"
        modelValue={value6}
        onCancel={close}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue6}
        show={active === 6}
      />
      <UPDatetimePicker
        closeOnClickOverlay
        maxDate={1786778555000}
        minDate={875635200}
        mode="datetime"
        modelValue={value7}
        onCancel={close}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue7}
        show={active === 7}
      />
      <UPDatetimePicker
        closeOnClickOverlay
        minHour={now.getHours()}
        minMinute={minMinute8}
        mode="time"
        modelValue={value8}
        onCancel={close}
        onChange={changeTime8}
        onClose={close}
        onConfirm={confirm}
        onUpdateModelValue={setValue8}
        show={active === 8}
      />
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 30, marginRight: 8, width: 30 },
  formWrap: { paddingHorizontal: 15 },
  page: { flex: 1, padding: 0 },
  toolbarRight: { paddingRight: 10 },
});
