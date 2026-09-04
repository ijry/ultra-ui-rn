/**
 * CityLocate 城市定位选择
 * 严格复刻 uview-plus pages/componentsD/cityLocate/cityLocate.nvue
 */
import React, { useState } from 'react';
import {
  UPCityLocate,
  type UPCityItem,
  type UPCityLocationResult,
  type UPIndexValue,
} from 'ultra-ui-rn';
import { DemoPage, EventLog, PageItem, PropsTable } from '../_shared';

const indexList: UPIndexValue[] = ['🔥', { key: 'All', name: '所有城市' }];

// 源 demo 另外传了 hotCity（本地组件无此 prop），其内容与 cityList[0] 完全相同，
// 本地组件把 cityList[0] 当作热门城市宫格渲染，所以这里复用同一份数据。
const hotCity: UPCityItem[] = [
  { name: '北京', value: 'beijing' },
  { name: '上海', value: 'shanghai' },
  { name: '广州', value: 'guangzhou' },
];

const cityList: UPCityItem[][] = [
  hotCity,
  [
    { name: '北京', value: 'beijing' },
    { name: '上海', value: 'shanghai' },
    { name: '广州', value: 'guangzhou' },
    { name: '深圳', value: 'shenzhen' },
    { name: '杭州', value: 'hangzhou' },
  ],
];

// 源组件内部调用 uni.getLocation；RN 没有对应 API，本地组件把定位实现下沉到
// 应用层的 locate prop，这里用一个固定结果替代。
const locate = (): Promise<UPCityLocationResult> => Promise.resolve({
  address: { city: '南京' },
  latitude: 32.0603,
  longitude: 118.7969,
});

const PROPS = [
  { prop: 'indexList', type: 'Array<string | number | { key?; name? }>', default: "['🔥']", desc: '右侧索引条数据' },
  { prop: 'cityList', type: 'Array<Array<Record<string, unknown>>>', default: '北京/上海/广州/深圳/杭州', desc: '分组城市数据，第 0 组渲染为热门城市宫格' },
  { prop: 'locationType', type: 'string', default: "'wgs84'", desc: '定位坐标系类型，透传给 locate' },
  { prop: 'currentCity', type: 'string', default: "''", desc: '外部指定的当前城市，会覆盖定位结果' },
  { prop: 'nameKey', type: 'string', default: "'name'", desc: '城市对象里的名称字段名' },
  { prop: 'locate', type: '(locationType) => Promise<UPCityLocationResult>', default: '—', desc: '应用提供的定位实现' },
  { prop: 'onLocationSuccess', type: '(result) => void', default: '—', desc: '定位成功时触发' },
  { prop: 'onSelectCity', type: '({ locationCity }) => void', default: '—', desc: '选择城市时触发' },
];

export default function CityLocateDemo() {
  const [currentCity, setCurrentCity] = useState('');
  const [events, setEvents] = useState<string[]>([]);

  const locationSuccess = (result: UPCityLocationResult & { locationCity: string }) => {
    // 根据gps坐标去换取地址
    // 然后传递给组件
    setCurrentCity('南京');
    setEvents((list) => [...list, `location-success: ${result.locationCity}`]);
  };

  const selectCity = (payload: { locationCity: string }) => {
    // 选择城市处理
    setEvents((list) => [...list, `select-city: ${payload.locationCity}`]);
  };

  return (
    <DemoPage>
      <PageItem title="基础用法">
        <UPCityLocate
          cityList={cityList}
          currentCity={currentCity}
          indexList={indexList}
          locate={locate}
          locationType="wgs84"
          onLocationSuccess={locationSuccess}
          onSelectCity={selectCity}
        />
      </PageItem>

      <EventLog events={events} />

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
