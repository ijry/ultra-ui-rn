/**
 * Waterfall 瀑布流
 * 严格复刻 uview-plus pages/componentsB/waterfall/waterfall.nvue
 */
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UPIcon, UPLoadmore, UPWaterfall, type UPWaterfallRef } from 'ultra-ui-rn';

type FlowItem = {
  id: string;
  image: string;
  price: number;
  shop: string;
  title: string;
};

const LIST_DATA: Omit<FlowItem, 'id'>[] = [
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png', price: 35, shop: '李白杜甫白居易旗舰店', title: '北国风光，千里冰封，万里雪飘' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png', price: 75, shop: '李白杜甫白居易旗舰店', title: '望长城内外，惟余莽莽' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png', price: 385, shop: '李白杜甫白居易旗舰店', title: '大河上下，顿失滔滔' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png', price: 784, shop: '李白杜甫白居易旗舰店', title: '欲与天公试比高' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png', price: 7891, shop: '李白杜甫白居易旗舰店', title: '须晴日，看红装素裹，分外妖娆' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png', price: 2341, shop: '李白杜甫白居易旗舰店', title: '江山如此多娇，引无数英雄竞折腰' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png', price: 661, shop: '李白杜甫白居易旗舰店', title: '惜秦皇汉武，略输文采' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png', price: 1654, shop: '李白杜甫白居易旗舰店', title: '唐宗宋祖，稍逊风骚' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper3.png', price: 1678, shop: '李白杜甫白居易旗舰店', title: '一代天骄，成吉思汗' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png', price: 924, shop: '李白杜甫白居易旗舰店', title: '只识弯弓射大雕' },
  { image: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper2.png', price: 8243, shop: '李白杜甫白居易旗舰店', title: '俱往矣，数风流人物，还看今朝' },
];

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function guid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function WaterfallDemo() {
  const uWaterfallRef = useRef<UPWaterfallRef<FlowItem>>(null);
  const [loadStatus, setLoadStatus] = useState<'loadmore' | 'loading' | 'nomore'>('loadmore');
  const [flowList, setFlowList] = useState<FlowItem[]>([]);

  React.useEffect(() => {
    addRandomData();
  }, []);

  const addRandomData = () => {
    setLoadStatus('loading');
    setTimeout(() => {
      const newItems: FlowItem[] = [];
      for (let i = 0; i < 10; i++) {
        const index = random(0, LIST_DATA.length - 1);
        const item = JSON.parse(JSON.stringify(LIST_DATA[index])) as FlowItem;
        item.id = guid();
        newItems.push(item);
      }
      setFlowList((prev) => [...prev, ...newItems]);
      setLoadStatus('loadmore');
    }, 1000);
  };

  const remove = (id: string) => {
    uWaterfallRef.current?.remove(id);
  };

  return (
    <View style={s.wrap}>
      <UPWaterfall
        ref={uWaterfallRef}
        columns="auto"
        height="100%"
        value={flowList}
        onChange={(newList) => setFlowList([...newList])}
        renderItem={({ item }) => (
          <View style={s.demoWarter}>
            <Image source={{ uri: item.image }} style={s.demoImage} />
            <Text style={s.demoTitle}>{item.title}</Text>
            <Text style={s.demoPrice}>{item.price}元</Text>
            <View style={s.demoTag}>
              <View style={s.demoTagOwner}>
                <Text style={s.tagText}>自营</Text>
              </View>
              <View style={s.demoTagText}>
                <Text style={s.tagText2}>放心购</Text>
              </View>
            </View>
            <Text style={s.demoShop}>{item.shop}</Text>
            <View style={s.uClose}>
              <UPIcon color="#fa3534" name="close-circle-fill" size={16} onClick={() => remove(item.id)} />
            </View>
          </View>
        )}
      />
      <UPLoadmore status={loadStatus} onLoadmore={addRandomData} />
    </View>
  );
}

const s = StyleSheet.create({
  demoImage: { borderRadius: 4, height: undefined, width: '100%', aspectRatio: 1.5 },
  demoPrice: { color: '#fa3534', fontSize: 15, marginTop: 2.5 },
  demoShop: { color: '#909399', fontSize: 11, marginTop: 2.5 },
  demoTag: { flexDirection: 'row', marginTop: 2.5 },
  demoTagOwner: { alignItems: 'center', backgroundColor: '#fa3534', borderRadius: 10, justifyContent: 'center', lineHeight: 1, paddingHorizontal: 7, paddingVertical: 2 },
  demoTagText: { alignItems: 'center', borderColor: '#3c9cff', borderRadius: 10, borderWidth: 1, justifyContent: 'center', lineHeight: 1, marginLeft: 10, paddingHorizontal: 7, paddingVertical: 2 },
  demoTitle: { color: '#303133', fontSize: 15, marginTop: 2.5 },
  demoWarter: { backgroundColor: '#fff', borderRadius: 8, margin: 2.5, padding: 8, position: 'relative' },
  tagText: { color: '#ffffff', fontSize: 12 },
  tagText2: { color: '#3c9cff', fontSize: 12 },
  uClose: { opacity: 0, position: 'absolute', right: 3, top: -7 },
  wrap: { backgroundColor: 'transparent', flex: 1, paddingHorizontal: 15, paddingTop: 15 },
});
