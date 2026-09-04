/**
 * Calendar 日历
 * 严格复刻 uview-plus pages/componentsC/calendar/calendar.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  UPAlert,
  UPCalendar,
  UPCalendarStrip,
  UPCell,
  UPCellGroup,
  type UPCalendarDay,
} from 'ultra-ui-rn';
import { PropsTable } from '../_shared';

// 初始化日期数据
const d = new Date();
const year = d.getFullYear();
const month = String(d.getMonth() + 1).padStart(2, '0');
const date = d.getDate();

/**
 * 源 demo 直接拼接未补零的日号（`${date + 5}`）；本地 normalizeCalendarDate 只接受
 * 严格的 `YYYY-MM-DD`，所以在保留同样日号加法的前提下补零。
 */
const dayText = (offset: number) => `${year}-${month}-${String(date + offset).padStart(2, '0')}`;

const customThemeDefaultDate = [dayText(0), dayText(5)];
const customTextDefaultDate = [dayText(0)];
const minDate = '2022-08-09';
const maxDate = dayText(10);
const defaultDateMultiple = [dayText(0), dayText(1), dayText(2)];
const switchMinDate = '2022-01-01';
const switchMaxDate = '2024-12-31';
const switchRangeDefaultDate = ['2023-06-15', '2023-06-20'];
const switchMultipleDefaultDate = ['2023-06-15', '2023-07-15', '2024-06-15'];

const icon = (n: number) => `https://uview-plus.jiangruyi.com/uview/demo/calendar/${n}.png`;

const list = [
  { iconUrl: icon(7), title: '单个日期' },
  { iconUrl: icon(8), title: '多个日期' },
  { iconUrl: icon(9), title: '日期范围' },
  { iconUrl: icon(15), title: '自定义主题颜色' },
  { iconUrl: icon(14), title: '自定义文案' },
  { iconUrl: icon(13), title: '日期最大范围' },
  { iconUrl: icon(5), title: '显示农历' },
  { iconUrl: icon(10), title: '默认日期' },
  { iconUrl: icon(10), title: '日期最小范围' },
  { iconUrl: icon(7), title: '单月切换-单选' },
  { iconUrl: icon(9), title: '单月切换-日期区间' },
  { iconUrl: icon(8), title: '单月切换-多选' },
];

// 源 confirm 按索引拼接回显：多选用 ';' 连接，区间取首尾，其余取第一个日期。
const MULTIPLE_INDEXES = [1, 7, 11];
const RANGE_INDEXES = [2, 3, 4, 10];

function formatValue(index: number, dates: readonly string[]): string {
  if (MULTIPLE_INDEXES.includes(index)) return dates.join(';');
  if (RANGE_INDEXES.includes(index)) return `${dates[0]}~${dates[dates.length - 1]}`;
  return dates[0] ?? '';
}

// 源 formatter：给「今天 + 3 天」补上底部文案和角标
function formatter(day: UPCalendarDay): UPCalendarDay {
  const now = new Date();
  if (day.month === now.getMonth() + 1 && day.day === now.getDate() + 3) {
    return { ...day, bottomInfo: '有优惠', dot: true };
  }
  return day;
}

const PROPS = [
  { prop: 'title', type: 'string', default: "'日期选择'", desc: '顶部标题' },
  { prop: 'showTitle', type: 'boolean', default: 'true', desc: '是否显示顶部标题' },
  { prop: 'showSubtitle', type: 'boolean', default: 'true', desc: '是否显示副标题（年月）' },
  { prop: 'mode', type: "'single' | 'multiple' | 'range'", default: "'single'", desc: '选择模式' },
  { prop: 'startText', type: 'string', default: "'开始'", desc: 'range 模式起始日期的底部文字' },
  { prop: 'endText', type: 'string', default: "'结束'", desc: 'range 模式结束日期的底部文字' },
  { prop: 'customList', type: 'UPCalendarDayCustom[]', default: '[]', desc: '指定日期的自定义信息' },
  { prop: 'color', type: 'string', default: "'#3c9cff'", desc: '主题色' },
  { prop: 'minDate', type: 'string | number | Date | null', default: '0', desc: '可选的最小日期' },
  { prop: 'maxDate', type: 'string | number | Date | null', default: '0', desc: '可选的最大日期' },
  { prop: 'defaultDate', type: 'Date | string | number | Array | null', default: 'null', desc: '默认选中的日期' },
  { prop: 'maxCount', type: 'number | string', default: 'MAX_SAFE_INTEGER', desc: 'multiple 模式最多可选数量' },
  { prop: 'rowHeight', type: 'number | string', default: '56', desc: '日期行高' },
  { prop: 'formatter', type: '(day) => day', default: 'null', desc: '日期格式化函数' },
  { prop: 'showLunar', type: 'boolean', default: 'false', desc: '是否显示农历' },
  { prop: 'showMark', type: 'boolean', default: 'true', desc: '是否显示背景月份水印' },
  { prop: 'confirmText', type: 'string', default: "'确认'", desc: '确认按钮文字' },
  { prop: 'confirmDisabledText', type: 'string', default: "'确认'", desc: '确认按钮禁用时的文字' },
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示日历弹窗' },
  { prop: 'overlay', type: 'boolean', default: 'true', desc: '是否显示遮罩' },
  { prop: 'duration', type: 'number | string', default: '300', desc: '弹窗动画时长' },
  { prop: 'overlayStyle', type: 'ViewStyle', default: '{}', desc: '遮罩自定义样式' },
  { prop: 'overlayOpacity', type: 'number | string', default: '0.5', desc: '遮罩透明度' },
  { prop: 'zIndex', type: 'number | string', default: '10075', desc: '弹窗层级' },
  { prop: 'safeAreaInsetBottom', type: 'boolean', default: 'true', desc: '是否留出底部安全区' },
  { prop: 'safeAreaInsetTop', type: 'boolean', default: 'false', desc: '是否留出顶部安全区' },
  { prop: 'bgColor', type: 'string', default: "''", desc: '日历背景色' },
  { prop: 'closeOnClickOverlay', type: 'boolean', default: 'false', desc: '点击遮罩是否关闭' },
  { prop: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
  { prop: 'showConfirm', type: 'boolean', default: 'true', desc: '是否显示确认按钮' },
  { prop: 'maxRange', type: 'number | string', default: 'MAX_SAFE_INTEGER', desc: 'range 模式最大可选天数' },
  { prop: 'rangePrompt', type: 'string', default: "''", desc: '超出 maxRange 时的提示语' },
  { prop: 'showRangePrompt', type: 'boolean', default: 'true', desc: '超出 maxRange 时是否提示' },
  { prop: 'allowSameDay', type: 'boolean', default: 'false', desc: 'range 模式是否允许同一天' },
  { prop: 'rangeResultMode', type: "'all' | 'boundary'", default: "'all'", desc: 'range 结果返回全部日期还是首尾' },
  { prop: 'enableTime', type: 'boolean', default: 'false', desc: '是否附带时间选择' },
  { prop: 'timePrecision', type: "'hour' | 'minute' | 'second'", default: "'minute'", desc: '时间选择精度' },
  { prop: 'defaultTime', type: 'string', default: "''", desc: '默认时间' },
  { prop: 'round', type: 'boolean | number | string', default: '0', desc: '弹窗圆角' },
  { prop: 'monthNum', type: 'number | string', default: '3', desc: '未指定 maxDate 时渲染的月份数' },
  { prop: 'monthSwitch', type: 'boolean', default: 'false', desc: '是否单月切换模式' },
  { prop: 'showToday', type: 'boolean', default: 'true', desc: '是否显示「今天」按钮' },
  { prop: 'todayColor', type: 'string', default: "''", desc: '今天的高亮色' },
  { prop: 'weekText', type: 'string[]', default: "['一'...'日']", desc: '星期栏文字' },
  { prop: 'forbidDays', type: 'Array<string | number | Date>', default: '[]', desc: '禁止选择的日期' },
  { prop: 'forbidDaysToast', type: 'string', default: "'此日期不可选'", desc: '点击禁选日期的提示语' },
  { prop: 'monthFormat', type: 'string', default: "''", desc: '月份标题格式（本地实现暂未使用）' },
  { prop: 'pageInline', type: 'boolean', default: 'false', desc: '是否以页面行内方式渲染（不用弹窗）' },
  { prop: 'footer', type: 'ReactNode', default: '—', desc: '自定义底部内容（源 footer 插槽）' },
  { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '日历容器自定义样式' },
  { prop: 'onConfirm', type: '(dates: string[]) => void', default: '—', desc: '点击确认或选满时触发' },
  { prop: 'onClose', type: '() => void', default: '—', desc: '弹窗关闭时触发' },
  { prop: 'onChangeShow', type: '(show: boolean) => void', default: '—', desc: '弹窗显示状态变化时触发' },
];


export default function CalendarDemo() {
  const [active, setActive] = useState(0);
  const [values, setValues] = useState<readonly string[]>(() => list.map(() => ''));
  const [stripValue, setStripValue] = useState(dayText(0));

  const showCalendar = (index: number) => setActive(index + 1);
  const close = () => setActive(0);
  const confirm = (dates: string[]) => {
    const index = active - 1;
    setActive(0);
    if (index < 0) return;
    setValues((previous) => previous.map((value, i) => (i === index ? formatValue(index, dates) : value)));
  };

  return (
    <View style={s.page}>
      <UPCellGroup>
        {list.map((item, index) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            label={values[index]}
            onClick={() => showCalendar(index)}
            title={item.title}
          />
        ))}
        <UPAlert description="页面行内模式" />
        <UPCalendar
          defaultDate="2022-02-15"
          pageInline
          show
          showConfirm={false}
          showTitle={false}
        />
        <UPAlert description="单行日历（支持切月、下拉展开完整月历）" />
        <UPCalendarStrip
          maxDate={switchMaxDate}
          minDate={switchMinDate}
          modelValue={stripValue}
          onUpdateModelValue={setStripValue}
        />
        <Text style={s.calendarStripValue}>{stripValue}</Text>
      </UPCellGroup>

      <UPCalendar
        defaultDate="2022-02-15"
        onClose={close}
        onConfirm={confirm}
        show={active === 1}
      />
      <UPCalendar
        defaultDate={['2022-03-01']}
        mode="multiple"
        onClose={close}
        onConfirm={confirm}
        show={active === 2}
      />
      <UPCalendar mode="range" onClose={close} onConfirm={confirm} show={active === 3} />
      <UPCalendar
        color="#f56c6c"
        defaultDate={customThemeDefaultDate}
        mode="range"
        onClose={close}
        onConfirm={confirm}
        show={active === 4}
      />
      <UPCalendar
        confirmDisabledText="请选择离店日期"
        defaultDate={customTextDefaultDate}
        endText="离店"
        formatter={formatter}
        mode="range"
        onClose={close}
        onConfirm={confirm}
        show={active === 5}
        startText="住店"
      />
      <UPCalendar maxDate={maxDate} onClose={close} onConfirm={confirm} show={active === 6} />
      <UPCalendar onClose={close} onConfirm={confirm} show={active === 7} showLunar />

      <UPCalendar
        defaultDate={defaultDateMultiple}
        mode="multiple"
        onClose={close}
        onConfirm={confirm}
        show={active === 8}
      />
      <UPCalendar
        defaultDate="2022-09-09"
        maxDate="2023-07-05"
        minDate={minDate}
        onClose={close}
        onConfirm={confirm}
        show={active === 9}
      />
      <UPCalendar
        defaultDate="2023-06-15"
        maxDate={switchMaxDate}
        minDate={switchMinDate}
        monthNum={36}
        monthSwitch
        onClose={close}
        onConfirm={confirm}
        show={active === 10}
      />
      <UPCalendar
        defaultDate={switchRangeDefaultDate}
        maxDate={switchMaxDate}
        minDate={switchMinDate}
        mode="range"
        monthNum={36}
        monthSwitch
        onClose={close}
        onConfirm={confirm}
        show={active === 11}
      />
      <UPCalendar
        defaultDate={switchMultipleDefaultDate}
        maxDate={switchMaxDate}
        minDate={switchMinDate}
        mode="multiple"
        monthNum={36}
        monthSwitch
        onClose={close}
        onConfirm={confirm}
        show={active === 12}
      />

      <View style={s.propsWrap}>
        <PropsTable rows={PROPS} />
      </View>


    </View>
  );
}

const s = StyleSheet.create({
  calendarStripValue: {
    color: '#909399',
    fontSize: 12,
    lineHeight: 22,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  page: { padding: 0 },
  propsWrap: { paddingBottom: 40, paddingHorizontal: 15, paddingTop: 15 },
});

