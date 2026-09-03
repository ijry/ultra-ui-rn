/**
 * IndexList 索引列表
 * 严格复刻 uview-plus pages/componentsC/indexList/indexList.nvue
 */
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UPAvatar, UPIndexAnchor, UPIndexItem, UPIndexList, UPLine } from 'ultra-ui-rn';
import { DemoPage } from '../_shared';

const urls = [
  'https://uview-plus.jiangruyi.com/uview/album/1.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/2.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/3.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/4.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/5.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/6.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/7.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/8.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/9.jpg',
  'https://uview-plus.jiangruyi.com/uview/album/10.jpg',
];

const names = [
  '勇往无敌',
  '疯狂的迪飙',
  '磊爱可',
  '梦幻梦幻梦',
  '枫中飘瓢',
  '飞翔天使',
  '曾经第一',
  '追风幻影族长',
  '麦小姐',
  '胡格罗雅',
  'Red磊磊',
  '乐乐立立',
  '青龙爆风',
  '跑跑卡叮车',
  '山里狼',
  'supersonic超',
];

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function IndexListDemo() {
  const indexList = useMemo(() => {
    const list: string[] = [];
    const charCodeOfA = 'A'.charCodeAt(0);
    list.push('↑');
    list.push('☆');
    for (let i = 0; i < 16; i++) {
      list.push(String.fromCharCode(charCodeOfA + i));
    }
    list.push('#');
    return list;
  }, []);

  const itemArr = useMemo(() => {
    return indexList.map(() => {
      const arr: Array<{ name: string; url: string }> = [];
      for (let i = 0; i < 10; i++) {
        arr.push({
          name: names[random(0, names.length - 1)],
          url: urls[random(0, urls.length - 1)],
        });
      }
      return arr;
    });
  }, [indexList]);

  return (
    <DemoPage>
      <UPIndexList indexList={indexList}>
        {/* header slot */}
        <View style={s.list}>
          <View style={s.listItem}>
            <UPAvatar fontSize={26} icon="man-add-fill" randomBgColor shape="square" size={35} />
            <Text style={s.listItemUserName}>新的朋友</Text>
          </View>
          <UPLine />
          <View style={s.listItem}>
            <UPAvatar fontSize={26} icon="tags-fill" randomBgColor shape="square" size={35} />
            <Text style={s.listItemUserName}>标签</Text>
          </View>
          <UPLine />
          <View style={s.listItem}>
            <UPAvatar fontSize={26} icon="chrome-circle-fill" randomBgColor shape="square" size={35} />
            <Text style={s.listItemUserName}>朋友圈</Text>
          </View>
          <UPLine />
          <View style={s.listItem}>
            <UPAvatar fontSize={26} icon="qq-fill" randomBgColor shape="square" size={35} />
            <Text style={s.listItemUserName}>QQ</Text>
          </View>
          <UPLine />
        </View>

        {indexList.map((letter, index) => (
          <UPIndexItem key={index}>
            <UPIndexAnchor text={letter} />
            <View style={s.list}>
              {itemArr[index].map((item1, index1) => (
                <View key={index1}>
                  <View style={s.listItem}>
                    <Image source={{ uri: item1.url }} style={s.listItemAvatar} />
                    <Text style={s.listItemUserName}>{item1.name}</Text>
                  </View>
                  <UPLine />
                </View>
              ))}
            </View>
          </UPIndexItem>
        ))}

        {/* footer slot */}
        <View>
          <Text style={s.listFooter}>共305位好友</Text>
        </View>
      </UPIndexList>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  list: {},
  listFooter: {
    color: '#909399',
    fontSize: 14,
    marginVertical: 15,
    textAlign: 'center',
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listItemAvatar: {
    borderRadius: 3,
    height: 35,
    width: 35,
  },
  listItemUserName: {
    color: '#303133',
    fontSize: 16,
    marginLeft: 10,
  },
});
