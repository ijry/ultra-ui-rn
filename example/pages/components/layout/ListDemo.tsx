/**
 * List 列表
 * 严格复刻 uview-plus pages/componentsC/list/list.nvue
 */
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPAvatar, UPCell, UPList, UPListItem, random } from 'ultra-ui-rn';

const urls = [
  'https://uview-plus.jiangruyi.com/album/1.jpg',
  'https://uview-plus.jiangruyi.com/album/2.jpg',
  'https://uview-plus.jiangruyi.com/album/3.jpg',
  'https://uview-plus.jiangruyi.com/album/4.jpg',
  'https://uview-plus.jiangruyi.com/album/5.jpg',
  'https://uview-plus.jiangruyi.com/album/6.jpg',
  'https://uview-plus.jiangruyi.com/album/7.jpg',
  'https://uview-plus.jiangruyi.com/album/8.jpg',
  'https://uview-plus.jiangruyi.com/album/9.jpg',
  'https://uview-plus.jiangruyi.com/album/10.jpg',
];

export default function ListDemo() {
  const [indexList, setIndexList] = useState<Array<{ url: string }>>([]);

  const loadmore = useCallback(() => {
    setIndexList((prev) => [
      ...prev,
      ...Array.from({ length: 30 }, () => ({ url: urls[random(0, urls.length - 1)]! })),
    ]);
  }, []);

  useEffect(() => {
    loadmore();
  }, [loadmore]);

  return (
    <View style={s.page}>
      <UPList onScrollToLower={loadmore}>
        {indexList.map((item, index) => (
          <UPListItem key={index}>
            <UPCell
              iconNode={
                <UPAvatar customStyle={s.avatar} shape="square" size="35" src={item.url} />
              }
              title={`列表长度-${index + 1}`}
            />
          </UPListItem>
        ))}
      </UPList>
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { marginBottom: -3, marginRight: 5, marginTop: -3 },
  page: { flex: 1, padding: 0 },
});
