/**
 * CountDown 倒计时
 * 严格复刻 uview-plus pages/componentsB/countDown/countDown.nvue
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  UPCountDown,
  UPGrid,
  UPGridItem,
  UPIcon,
  type UPCountDownRef,
} from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'time', type: 'number | string', default: '0', desc: '倒计时时长，单位 ms' },
  { prop: 'format', type: 'string', default: "'HH:mm:ss'", desc: '时间格式（DD/HH/mm/ss/SSS）' },
  { prop: 'autoStart', type: 'boolean', default: 'true', desc: '是否自动开始倒计时' },
  { prop: 'millisecond', type: 'boolean', default: 'false', desc: '是否开启毫秒级渲染' },
  { prop: 'children', type: 'ReactNode | (timeData) => ReactNode', default: '—', desc: '自定义内容（源默认插槽）' },
  { prop: 'onChange', type: '(timeData) => void', default: '—', desc: '倒计时变化时触发' },
  { prop: 'onFinish', type: '() => void', default: '—', desc: '倒计时结束时触发' },
];

const TIME = 30 * 60 * 60 * 1000;

export default function CountDownDemo() {
  const countDown = useRef<UPCountDownRef>(null);
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage>
      <Section title="基础用法">
        <UPCountDown
          autoStart
          format="HH:mm:ss"
          millisecond
          onFinish={() => setEvents((prev) => [...prev, 'finish'])}
          time={TIME}
        />
      </Section>

      <Section title="自定义格式">
        <UPCountDown autoStart format="DD:HH:mm:ss" millisecond time={TIME}>
          {(timeData) => (
            <View style={s.time}>
              <Text style={s.timeItem}>{timeData.days}&nbsp;天</Text>
              <Text style={s.timeItem}>
                {timeData.hours > 10 ? timeData.hours : `0${timeData.hours}`}&nbsp;时
              </Text>
              <Text style={s.timeItem}>{timeData.minutes}&nbsp;分</Text>
              <Text style={s.timeItem}>{timeData.seconds}&nbsp;秒</Text>
            </View>
          )}
        </UPCountDown>
      </Section>

      <Section title="毫秒级渲染">
        <UPCountDown autoStart format="HH:mm:ss:SSS" millisecond time={TIME} />
      </Section>

      <Section title="自定义样式">
        <UPCountDown autoStart format="HH:mm:ss" millisecond time={TIME}>
          {(timeData) => (
            <View style={s.time}>
              <View style={s.timeCustom}>
                <Text style={s.timeCustomItem}>
                  {timeData.hours > 10 ? timeData.hours : `0${timeData.hours}`}
                </Text>
              </View>
              <Text style={s.timeDoc}>:</Text>
              <View style={s.timeCustom}>
                <Text style={s.timeCustomItem}>{timeData.minutes}</Text>
              </View>
              <Text style={s.timeDoc}>:</Text>
              <View style={s.timeCustom}>
                <Text style={s.timeCustomItem}>{timeData.seconds}</Text>
              </View>
            </View>
          )}
        </UPCountDown>
      </Section>

      <Section contentStyle={s.transparent} title="手动控制">
        <View style={s.block}>
          <UPCountDown
            autoStart={false}
            format="ss:SSS"
            millisecond
            ref={countDown}
            time={3 * 1000}
          />
        </View>
        <UPGrid border customStyle={s.grid}>
          <UPGridItem onClick={() => countDown.current?.reset()}>
            <View style={s.gridItem}>
              <UPIcon name="reload" size={22} />
              <Text style={s.gridText}>重置</Text>
            </View>
          </UPGridItem>
          <UPGridItem onClick={() => countDown.current?.start()}>
            <View style={s.gridItem}>
              <View style={s.gridCircle}>
                <UPIcon color="#fff" name="play-right-fill" size={22} />
              </View>
              <Text style={s.gridText}>开始</Text>
            </View>
          </UPGridItem>
          <UPGridItem onClick={() => countDown.current?.pause()}>
            <View style={s.gridItem}>
              <UPIcon name="pause-circle" size={22} />
              <Text style={s.gridText}>暂停</Text>
            </View>
          </UPGridItem>
        </UPGrid>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  block: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  grid: { marginTop: 10 },
  gridCircle: {
    alignItems: 'center',
    backgroundColor: '#3c9cff',
    borderRadius: 32,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  gridItem: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  gridText: { color: '#909399', fontSize: 14, marginLeft: 6 },
  time: { alignItems: 'center', flexDirection: 'row' },
  timeCustom: {
    alignItems: 'center',
    backgroundColor: '#3c9cff',
    borderRadius: 4,
    height: 22,
    justifyContent: 'center',
    marginTop: 4,
    width: 22,
  },
  timeCustomItem: { color: '#fff', fontSize: 12, textAlign: 'center' },
  timeDoc: { color: '#3c9cff', paddingHorizontal: 4 },
  timeItem: { color: '#606266', fontSize: 15, marginRight: 4 },
  transparent: { backgroundColor: 'transparent', padding: 0 },
});
