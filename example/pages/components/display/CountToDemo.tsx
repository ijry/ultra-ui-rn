/**
 * CountTo 数字滚动
 * 严格复刻 uview-plus pages/componentsB/countTo/countTo.nvue
 */
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPCountTo, UPGrid, UPGridItem, type UPCountToRef } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'startVal', type: 'number | string', default: '0', desc: '开始值' },
  { prop: 'endVal', type: 'number | string', default: '0', desc: '结束值' },
  { prop: 'duration', type: 'number | string', default: '2000', desc: '滚动过程所需时间，单位 ms' },
  { prop: 'autoplay', type: 'boolean', default: 'true', desc: '是否自动开始滚动' },
  { prop: 'decimals', type: 'number | string', default: '0', desc: '要显示的小数位数' },
  { prop: 'useEasing', type: 'boolean', default: 'true', desc: '滚动结束时是否缓动' },
  { prop: 'decimal', type: 'string', default: "'.'", desc: '小数分割符号' },
  { prop: 'separator', type: 'string', default: '—', desc: '千位分隔符' },
  { prop: 'color', type: 'string', default: '#606266', desc: '字体颜色' },
  { prop: 'fontSize', type: 'number | string', default: '22', desc: '字体大小' },
  { prop: 'bold', type: 'boolean', default: 'false', desc: '字体是否加粗' },
  { prop: 'onEnd', type: '() => void', default: '—', desc: '数值滚动到目标值时触发' },
];

/** Upstream wraps each counter in `.u-page__tag-item`. */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function CountToDemo() {
  const countTo = useRef<UPCountToRef>(null);

  return (
    <DemoPage>
      <Section direction="row" title="基础功能">
        <Item>
          <UPCountTo endVal={3000} />
        </Item>
      </Section>

      <Section direction="row" title="倒计数">
        <Item>
          <UPCountTo startVal={300} />
        </Item>
      </Section>

      <Section direction="row" title="显示小数位">
        <Item>
          <UPCountTo decimals={2} endVal={10.55} startVal={100.0} />
        </Item>
      </Section>

      <Section direction="row" title="千分位分隔符">
        <Item>
          <UPCountTo decimals={2} endVal={1542} separator="," startVal={2000} />
        </Item>
      </Section>

      <Section contentStyle={s.transparent} title="自定义控制">
        <View style={s.block}>
          <UPCountTo autoplay={false} endVal={3000} ref={countTo} />
        </View>
        <UPGrid align="center" border customStyle={s.grid}>
          <UPGridItem onClick={() => countTo.current?.start()}>
            <View style={s.gridSlot}>
              <View style={s.gridCircle}>
                <Text style={s.gridText}>开始</Text>
              </View>
            </View>
          </UPGridItem>
          <UPGridItem onClick={() => countTo.current?.paused()}>
            <View style={s.gridSlot}>
              <View style={s.gridCircle}>
                <Text style={s.gridText}>暂停</Text>
              </View>
            </View>
          </UPGridItem>
          <UPGridItem onClick={() => countTo.current?.resume()}>
            <View style={s.gridSlot}>
              <View style={s.gridCircle}>
                <Text style={s.gridText}>继续</Text>
              </View>
            </View>
          </UPGridItem>
        </UPGrid>
      </Section>

      <Section direction="row" title="自定义">
        <Item>
          <UPCountTo bold color="#909399" endVal={3000} fontSize={40} />
        </Item>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  block: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  grid: { marginBottom: 20, marginTop: 20 },
  gridCircle: {
    alignItems: 'center',
    backgroundColor: '#dbfbdb',
    borderRadius: 100,
    height: 50,
    justifyContent: 'center',
    margin: 2,
    width: 50,
  },
  gridSlot: {
    borderColor: '#dbfbdb',
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
  },
  gridText: { color: 'rgb(25, 190, 107)', fontSize: 13 },
  item: { flex: 1 },
  transparent: { backgroundColor: 'transparent', padding: 0 },
});
