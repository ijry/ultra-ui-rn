/**
 * LineProgress 线形进度条
 * 严格复刻 uview-plus pages/componentsB/progress/progress.nvue
 */
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UPLineProgress, range } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'percentage', type: 'number | string', default: '0', desc: '进度百分比' },
  { prop: 'showText', type: 'boolean', default: 'true', desc: '是否在进度条内显示百分比值' },
  { prop: 'height', type: 'number | string', default: '12', desc: '进度条高度' },
  { prop: 'activeColor', type: 'string', default: '#19be6b', desc: '已完成部分的颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#ececec', desc: '未完成部分的颜色' },
  { prop: 'fromRight', type: 'boolean', default: 'false', desc: '是否从右往左增长' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '自定义进度文字（源默认插槽）' },
];

export default function LineProgressDemo() {
  const [percentage1, setPercentage1] = useState(30);
  const [percentage6, setPercentage6] = useState(50);

  // 源在 onMounted 中 2.5 秒后把 percentage1 设为 120，用于验证超出 100 时被夹取。
  useEffect(() => {
    const timer = setTimeout(() => setPercentage1(120), 2500);
    return () => clearTimeout(timer);
  }, []);

  const computedWidth = (type: 'minus' | 'plus') => {
    setPercentage6((prev) => range(0, 100, type === 'plus' ? prev + 10 : prev - 10));
  };

  return (
    <DemoPage>
      <Section contentStyle={s.stretch} title="默认配置">
        <UPLineProgress />
      </Section>

      <Section contentStyle={s.stretch} title="基础功能">
        <UPLineProgress percentage={percentage1} />
      </Section>

      <Section contentStyle={s.stretch} title="不显示百分比">
        <UPLineProgress percentage={40} showText={false} />
      </Section>

      <Section contentStyle={s.stretch} title="从右往左">
        <UPLineProgress fromRight percentage={40} showText={false} />
      </Section>

      <Section contentStyle={s.stretch} title="自定义高度">
        <UPLineProgress height="8" percentage={50} showText={false} />
      </Section>

      <Section contentStyle={s.stretch} title="自定义颜色">
        <UPLineProgress
          activeColor="#3c9cff"
          height="8"
          inactiveColor="#f3f4f6"
          percentage={60}
          showText={false}
        />
      </Section>

      <Section contentStyle={s.stretch} title="自定义样式">
        <UPLineProgress
          activeColor="#3c9cff"
          height="8"
          inactiveColor="#f3f4f6"
          percentage={70}
          showText={false}
        >
          <Text style={s.percentageSlot}>70%</Text>
        </UPLineProgress>
      </Section>

      <Section contentStyle={s.stretch} title="手动加减">
        <UPLineProgress
          activeColor="#3c9cff"
          height="8"
          inactiveColor="#f3f4f6"
          percentage={percentage6}
          showText={false}
        />
        <View style={s.buttonGroup}>
          <Pressable onPress={() => computedWidth('minus')} style={s.buttonCircle}>
            <Text style={s.buttonText}>减少</Text>
          </Pressable>
          <Pressable onPress={() => computedWidth('plus')} style={s.buttonCircle}>
            <Text style={s.buttonText}>增加</Text>
          </Pressable>
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  buttonCircle: {
    alignItems: 'center',
    backgroundColor: '#dbfbdb',
    borderRadius: 100,
    height: 50,
    justifyContent: 'center',
    margin: 30,
    width: 50,
  },
  buttonGroup: { flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: 'rgb(25, 190, 107)', fontSize: 13 },
  percentageSlot: {
    backgroundColor: '#f9ae3d',
    borderRadius: 100,
    color: '#fff',
    fontSize: 10,
    marginRight: -5,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  stretch: { alignItems: 'stretch' },
});
