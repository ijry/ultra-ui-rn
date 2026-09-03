/**
 * PullRefresh 下拉刷新
 * 严格复刻 uview-plus pages/componentsD/pullRefresh/pullRefresh.vue
 */
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { UPIcon, UPPullRefresh } from 'ultra-ui-rn';
import { PageItem } from '../_shared';

type ListItem = { id: number; name: string };

const s = StyleSheet.create({
  container: { backgroundColor: '#f7f8fa', flex: 1 },
  customRefreshContent: { alignItems: 'center', flexDirection: 'column', justifyContent: 'center' },
  listContent: { flexDirection: 'column' },
  listItem: { backgroundColor: '#fff', borderBottomColor: '#eee', borderBottomWidth: 1, paddingHorizontal: 15, paddingVertical: 12 },
  listItemText: { color: '#303133', fontSize: 14 },
  page: { paddingBottom: 40, paddingHorizontal: 15, paddingTop: 15 },
  pullAnimation: { marginBottom: 4 },
  refreshEmoji: { color: '#606266', fontSize: 20 },
  refreshText: { color: '#303133', fontSize: 13 },
  refreshingAnimation: { marginBottom: 0 },
  releaseAnimation: { marginBottom: 4 },
  scrollArea: { height: 100 },
});

function PullContent(state: { distance: number; threshold: number; status: string }) {
  return (
    <View style={s.customRefreshContent}>
      <View style={s.pullAnimation}>
        <Text style={s.refreshEmoji}>👇</Text>
      </View>
      <Text style={s.refreshText}>下拉刷新 ({Math.round(state.distance)}px)</Text>
    </View>
  );
}

function ReleaseContent() {
  return (
    <View style={s.customRefreshContent}>
      <View style={s.releaseAnimation}>
        <Text style={s.refreshEmoji}>👆</Text>
      </View>
      <Text style={s.refreshText}>释放刷新</Text>
    </View>
  );
}

const RefreshingContent = (
  <View style={s.customRefreshContent}>
    <View style={s.refreshingAnimation}>
      <UPIcon name="https://uview-plus.jiangruyi.com/uview/ext/772bb6ae58cbd2c1.gif" size={50} />
    </View>
  </View>
);

export default function PullRefreshDemo() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshing1, setRefreshing1] = useState(false);
  const [refreshing2, setRefreshing2] = useState(false);
  const [refreshing3, setRefreshing3] = useState(false);
  const [listData, setListData] = useState<ListItem[]>([]);
  const [listData2, setListData2] = useState<ListItem[]>([]);
  const [listData3, setListData3] = useState<ListItem[]>([]);
  const [loadmoreConfig, setLoadmoreConfig] = useState({
    iconSize: 18,
    loadingText: '努力加载中...',
    loadmoreText: '上拉加载更多',
    nomoreText: '我们是有底线的',
    status: 'loadmore' as 'loadmore' | 'loading' | 'nomore',
  });

  const loadData = useCallback(() => {
    const data: ListItem[] = [];
    for (let i = 0; i < 8; i++) {
      data.push({ id: i, name: `Item ${i}` });
    }
    setListData(data);
    setListData2([...data]);
    setListData3([...data]);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
    }, 2000);
  }, [loadData]);

  const onRefresh1 = useCallback(() => {
    setRefreshing1(true);
    setTimeout(() => {
      loadData();
      setRefreshing1(false);
    }, 2000);
  }, [loadData]);

  const onRefresh2 = useCallback(() => {
    setRefreshing2(true);
    setTimeout(() => {
      loadData();
      setRefreshing2(false);
    }, 2000);
  }, [loadData]);

  const onRefresh3 = useCallback(() => {
    setRefreshing3(true);
    setTimeout(() => {
      loadData();
      setRefreshing3(false);
    }, 2000);
  }, [loadData]);

  const onLoadmore = useCallback(() => {
    setLoadmoreConfig((prev) => ({ ...prev, status: 'loading' }));
    setTimeout(() => {
      setListData2((prev) => [...prev, { id: prev.length, name: `Item ${prev.length}` }]);
      setLoadmoreConfig((prev) => ({ ...prev, status: 'loadmore' }));
    }, 2000);
  }, []);

  return (
    <ScrollView contentContainerStyle={s.page} style={s.container}>
      <PageItem title="基本使用">
        <UPPullRefresh
          height={200}
          refreshing={refreshing}
          threshold={50}
          useScrollView
          onRefresh={onRefresh}
        >
          <View style={s.listContent}>
            {listData.map((item) => (
              <View key={item.id} style={s.listItem}>
                <Text style={s.listItemText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </UPPullRefresh>
      </PageItem>

      <PageItem title="自定义下拉动画">
        <UPPullRefresh
          height={200}
          pull={PullContent}
          refreshing={refreshing1}
          refreshingNode={RefreshingContent}
          release={ReleaseContent}
          threshold={60}
          useScrollView
          onRefresh={onRefresh1}
        >
          <View style={s.listContent}>
            {listData.map((item) => (
              <View key={item.id} style={s.listItem}>
                <Text style={s.listItemText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </UPPullRefresh>
      </PageItem>

      <PageItem title="结合虚拟列表">
        <UPPullRefresh
          height={150}
          refreshing={refreshing3}
          useScrollView
          onRefresh={onRefresh3}
        >
          {/* // 上游结合 up-virtual-list，本地无该组件，用普通 ScrollView 替代 */}
          <View style={s.listContent}>
            {listData3.map((item) => (
              <View key={item.id} style={s.listItem}>
                <Text style={s.listItemText}>Item {item.id}: {item.name}</Text>
              </View>
            ))}
          </View>
        </UPPullRefresh>
      </PageItem>

      <PageItem title="上拉加载">
        <UPPullRefresh
          height={100}
          loadmoreProps={loadmoreConfig}
          refreshing={refreshing2}
          showLoadmore
          useScrollView={false}
          onLoadmore={onLoadmore}
          onRefresh={onRefresh2}
        >
          <ScrollView
            onScrollEndDrag={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 10) {
                onLoadmore();
              }
            }}
            scrollEventThrottle={16}
            style={s.scrollArea}
          >
            <View style={s.listContent}>
              {listData2.map((item) => (
                <View key={item.id} style={s.listItem}>
                  <Text style={s.listItemText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </UPPullRefresh>
      </PageItem>
    </ScrollView>
  );
}
