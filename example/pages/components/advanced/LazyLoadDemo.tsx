/**
 * LazyLoad 懒加载
 * 严格复刻 uview-plus pages/componentsA/lazyLoad/lazyLoad.nvue
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { UPLazyLoad, UPLoadmore } from 'ultra-ui-rn';

const DATA = [
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'error.jpg' }, // 这里会加载失败，显示错误的占位图
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'error.jpg' }, // 这里会加载失败，显示错误的占位图
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.pngg' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'error.jpg' }, // 这里会加载失败，显示错误的占位图
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'error.jpg' }, // 这里会加载失败，显示错误的占位图
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png' },
  { src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png' },
  { src: 'error.jpg' }, // 这里会加载失败，显示错误的占位图
];

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function LazyLoadDemo() {
  const [list, setList] = useState<Array<{ src: string }>>([]);
  const [status, setStatus] = useState<'loadmore' | 'loading' | 'nomore'>('loadmore');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewport] = useState({ width: 350, height: 600 });
  const loadingRef = useRef(false);

  const getData = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setStatus('loading');
    setTimeout(() => {
      const newItems: Array<{ src: string }> = [];
      for (let i = 0; i < 10; i++) {
        const index = random(0, DATA.length - 1);
        newItems.push({ src: DATA[index].src });
      }
      setList((prev) => [...prev, ...newItems]);
      setStatus('loadmore');
      loadingRef.current = false;
    }, 1500);
  }, []);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={s.wrap}>
      <ScrollView
        contentContainerStyle={s.itemWarp}
        onScroll={(e) => setScrollOffset(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={100}
      >
        {list.map((item, index) => (
          <View key={index} style={s.item}>
            <UPLazyLoad
              borderRadius={10}
              height={100}
              image={item.src}
              imgMode="aspectFill"
              index={index}
              scrollOffset={scrollOffset}
              threshold={-225}
              viewport={viewport}
              width={350}
              onClick={(_idx) => {
                // console.log('clickImg', idx);
              }}
            />
          </View>
        ))}
      </ScrollView>
      <UPLoadmore status={status} onLoadmore={getData} />
    </View>
  );
}

const s = StyleSheet.create({
  item: {
    borderRadius: 5,
    height: 100,
    marginBottom: 10,
    overflow: 'hidden',
    width: 350,
  },
  itemWarp: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: 10,
  },
  wrap: {
    backgroundColor: '#f7f8fa',
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
});
