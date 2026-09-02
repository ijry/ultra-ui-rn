/**
 * Swiper 轮播图
 * 严格复刻 uview-plus pages/componentsC/swiper/swiper.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UPGap, UPSwiper, type UPSwiperItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'list', type: 'Array<string | object>', default: '[]', desc: '轮播数据' },
  { prop: 'keyName', type: 'string', default: "'url'", desc: 'list 为对象数组时的图片字段名' },
  { prop: 'indicator', type: 'boolean', default: 'false', desc: '是否显示指示器' },
  { prop: 'indicatorMode', type: "'line' | 'dot'", default: "'line'", desc: '指示器模式' },
  { prop: 'indicatorStyle', type: 'ViewStyle | string', default: '—', desc: '指示器位置样式' },
  { prop: 'autoplay', type: 'boolean', default: 'true', desc: '是否自动切换' },
  { prop: 'circular', type: 'boolean', default: 'false', desc: '是否衔接滑动' },
  { prop: 'vertical', type: 'boolean', default: 'false', desc: '是否纵向滑动' },
  { prop: 'height', type: 'number | string', default: '130', desc: '轮播高度' },
  { prop: 'radius', type: 'number | string', default: '4', desc: '轮播圆角' },
  { prop: 'showTitle', type: 'boolean', default: 'false', desc: '是否显示标题（需 list 带 title）' },
  { prop: 'loading', type: 'boolean', default: 'false', desc: '是否显示加载状态' },
  { prop: 'previousMargin', type: 'number | string', default: '0', desc: '前边距，用于露出前一项' },
  { prop: 'nextMargin', type: 'number | string', default: '0', desc: '后边距，用于露出后一项' },
  { prop: 'renderItem', type: '(item, index) => ReactNode', default: '—', desc: '自定义单项内容（源默认插槽）' },
  { prop: 'renderIndicator', type: '(current, length) => ReactNode', default: '—', desc: '自定义指示器（源 indicator 插槽）' },
  { prop: 'onChange', type: '(payload) => void', default: '—', desc: '切换时触发' },
];

const swiper = (n: number) => `https://uview-plus.jiangruyi.com/uview/swiper/swiper${n}.png`;

const list1 = [swiper(1), swiper(2), swiper(3)];

const list2: UPSwiperItem[] = [
  { image: swiper(2), title: '昨夜星辰昨夜风，画楼西畔桂堂东', type: 'image' },
  { image: swiper(1), title: '身无彩凤双飞翼，心有灵犀一点通' },
  { image: swiper(3), title: '谁念西风独自凉，萧萧黄叶闭疏窗，沉思往事立残阳' },
];

const list3 = [swiper(3), swiper(2), swiper(1)];

const list4: UPSwiperItem[] = [
  {
    url: 'https://uview-plus.jiangruyi.com/big/shanghai.mp4',
    title: '昨夜星辰昨夜风，画楼西畔桂堂东',
    poster: swiper(1),
  },
  { url: swiper(2), title: '身无彩凤双飞翼，心有灵犀一点通' },
  { url: swiper(3), title: '谁念西风独自凉，萧萧黄叶闭疏窗，沉思往事立残阳' },
];

const list5 = [swiper(3), swiper(2), swiper(1)];
const list6 = [swiper(2), swiper(3), swiper(1)];

export default function SwiperDemo() {
  const [current, setCurrent] = useState(0);
  const [currentNum, setCurrentNum] = useState(0);
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage>
      <Section contentStyle={s.flush} title="基础功能">
        <UPSwiper
          list={list1}
          onChange={(payload) => setEvents((prev) => [...prev, `change ${payload.current}`])}
          onClick={(index) => setEvents((prev) => [...prev, `click ${index}`])}
        />
      </Section>

      <Section contentStyle={s.flush} title="纵向滑动">
        <UPSwiper
          autoplay={false}
          height="200"
          indicator
          indicatorMode="dot"
          list={list1}
          vertical
        />
      </Section>

      <Section contentStyle={s.flush} title="带标题">
        <UPSwiper autoplay={false} circular keyName="image" list={list2} showTitle />
      </Section>

      <Section contentStyle={s.flush} title="带指示器">
        <UPSwiper circular indicator indicatorMode="line" list={list3} />
      </Section>

      <Section contentStyle={s.flush} title="加载中">
        <UPSwiper list={list3} loading />
      </Section>

      <Section contentStyle={s.flush} title="嵌入视频">
        {/* 首项是 mp4，本地 UPSwiper 无内建播放器，按图片降级渲染 poster。 */}
        <UPSwiper autoplay={false} keyName="url" list={list4} />
      </Section>

      <Section contentStyle={s.flush} title="自定义内容">
        <UPSwiper
          autoplay={false}
          circular
          keyName="image"
          list={list2}
          renderItem={(item) => (
            <Image
              source={{ uri: String((item as Record<string, unknown>).image ?? '') }}
              style={s.customImage}
            />
          )}
          showTitle
        />
      </Section>

      <Section contentStyle={s.flush} title="自定义指示器">
        <UPSwiper
          autoplay={false}
          list={list5}
          onChange={(payload) => setCurrent(payload.current)}
          renderIndicator={() => (
            <View style={s.indicator}>
              {list5.map((url, index) => (
                <View
                  key={url}
                  style={[s.indicatorDot, index === current ? s.indicatorDotActive : null]}
                />
              ))}
            </View>
          )}
        />
        <UPGap bgColor="transparent" height={15} />
        <UPSwiper
          autoplay={false}
          indicatorStyle={s.indicatorRight}
          list={list6}
          onChange={(payload) => setCurrentNum(payload.current)}
          renderIndicator={() => (
            <View style={s.indicatorNum}>
              <Text style={s.indicatorNumText}>{`${currentNum + 1}/${list6.length}`}</Text>
            </View>
          )}
        />
      </Section>

      <Section contentStyle={s.flush} title="卡片式">
        <UPSwiper
          autoplay={false}
          circular
          list={list3}
          nextMargin="30"
          previousMargin="30"
          radius="5"
        />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  customImage: { height: '100%', width: '100%' },
  flush: { backgroundColor: 'transparent', padding: 0 },
  indicator: { flexDirection: 'row', justifyContent: 'center' },
  indicatorDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 100,
    height: 6,
    marginHorizontal: 5,
    width: 6,
  },
  indicatorDotActive: { backgroundColor: '#ffffff' },
  indicatorNum: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 100,
    justifyContent: 'center',
    paddingVertical: 2,
    width: 35,
  },
  indicatorNumText: { color: '#FFFFFF', fontSize: 12 },
  indicatorRight: { right: 20 },
});
