/**
 * 组件示例页 - 高级组件
 * 上传、相册、轮播、表格、索引列表、瀑布流、树、拖拽排序、签名、画布
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  UP,
  UPUpload,
  type UPUploadAdapter,
  UPAlbum,
  UPSwiper,
  UPTable,
  UPTr,
  UPTh,
  UPTd,
  UPTable2,
  UPIndexList,
  UPIndexItem,
  UPIndexAnchor,
  UPCell,
  UPWaterfall,
  UPCard,
  UPTree,
  UPDragsort,
  UPSignature,
  UPButton,
  UPImage,
  UPText,
  UPVirtualList,
  UPPullRefresh,
  UPRefreshVirtualList,
} from 'ultra-ui-rn';

export default function AdvancedPage() {
  const [lastSwipeAction, setLastSwipeAction] = useState('');
  const [lastAlbumPreview, setLastAlbumPreview] = useState('none');
  const [selectedIndex, setSelectedIndex] = useState('A');
  const [slide, setSlide] = useState(0);
  const [table2SelectedKeys, setTable2SelectedKeys] = useState<readonly string[]>([]);

  const demoVirtualRows = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({ id: `v-${i}`, name: `虚拟行 ${i + 1}` })),
    [],
  );

  const demoDragRows = useMemo(
    () => [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Charlie' },
    ],
    [],
  );

  const demoTree = useMemo(
    () => [
      {
        id: 'media',
        label: '媒体',
        children: [
          { id: 'images', label: '图片' },
          { id: 'videos', label: '视频' },
        ],
      },
      { id: 'settings', label: '设置' },
    ],
    [],
  );

  const demoWaterfallItems = useMemo(
    () => [
      { id: '1', title: '短卡片', height: 96 },
      { id: '2', title: '高卡片', height: 156 },
      { id: '3', title: '中卡片', height: 124 },
    ],
    [],
  );

  const uploadAdapter = useMemo<UPUploadAdapter>(
    () => ({
      chooseFile: async () => [
        { name: 'demo.jpg', size: 128, type: 'image/jpeg', uri: 'https://picsum.photos/seed/upload/300/300' },
      ],
      previewFile: async (file) => {
        console.log('预览文件', file.uri);
      },
      uploadFile: async ({ file, onProgress }) => {
        onProgress(45);
        console.log('上传文件', file.uri);
        return { demo: true };
      },
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>高级组件</Text>

      {/* 上传 Upload */}
      <Text style={styles.section}>上传 Upload</Text>
      <UPUpload uploadAdapter={uploadAdapter} />

      {/* 相册 Album */}
      <Text style={styles.section}>相册 Album</Text>
      <UPAlbum
        maxCount={4}
        multipleSize={72}
        urls={[
          'https://picsum.photos/id/10/300/300',
          'https://picsum.photos/id/20/300/300',
          'https://picsum.photos/id/30/300/300',
        ]}
        onPreview={({ currentIndex, urls }) => {
          setLastAlbumPreview(`${currentIndex + 1}/${urls.length}`);
        }}
      />
      <Text>预览回调: {lastAlbumPreview}</Text>

      {/* 轮播 Swiper */}
      <Text style={styles.section}>轮播 Swiper</Text>
      <UPSwiper
        current={slide}
        indicator
        list={[
          { title: '春季新品', url: 'https://picsum.photos/seed/spring/800/320' },
          { title: '夏季系列', url: 'https://picsum.photos/seed/summer/800/320' },
        ]}
        onUpdateCurrent={setSlide}
      />
      <Text>当前轮播: {slide + 1}</Text>

      {/* 表格 Table */}
      <Text style={styles.section}>静态表格 Table</Text>
      <UPTable align="left">
        <UPTr>
          <UPTh width="50%">指标</UPTh>
          <UPTh>数值</UPTh>
        </UPTr>
        <UPTr>
          <UPTd width="50%">订单数</UPTd>
          <UPTd>128</UPTd>
        </UPTr>
        <UPTr>
          <UPTd width="50%">转化率</UPTd>
          <UPTd color="#5ac725">4.8%</UPTd>
        </UPTr>
      </UPTable>

      {/* 动态表格 Table2 */}
      <Text style={styles.section}>动态表格 Table2</Text>
      <UPTable2
        columns={[
          { key: 'select', title: '', type: 'selection' as const, width: 48 },
          { key: 'name', title: '名称', width: 140 },
          { key: 'amount', title: '金额', sortable: true, width: 90 },
        ]}
        data={[
          { id: '1', name: 'Ada', amount: 128 },
          { id: '2', name: 'Bea', amount: 84 },
        ]}
        height={180}
        onSelectionChange={(_rows, keys) => setTable2SelectedKeys(keys.map(String))}
        rowHeight={40}
        selectedRowKeys={table2SelectedKeys}
      />
      <Text>选中行: {table2SelectedKeys.length}</Text>

      {/* 索引列表 IndexList */}
      <Text style={styles.section}>索引列表 IndexList</Text>
      <UPIndexList
        height={200}
        indexList={['A', 'B', 'C']}
        onSelect={(index) => setSelectedIndex(String(index))}
      >
        <UPIndexItem index="A">
          <UPIndexAnchor text="A" />
          <UPCell title="阿姆斯特丹" />
          <UPCell title="雅典" />
        </UPIndexItem>
        <UPIndexItem index="B">
          <UPIndexAnchor text="B" />
          <UPCell title="柏林" />
          <UPCell title="波士顿" />
        </UPIndexItem>
        <UPIndexItem index="C">
          <UPIndexAnchor text="C" />
          <UPCell title="芝加哥" />
          <UPCell title="哥本哈根" />
        </UPIndexItem>
      </UPIndexList>
      <Text>选中索引: {selectedIndex}</Text>

      {/* 瀑布流 Waterfall */}
      <Text style={styles.section}>瀑布流 Waterfall</Text>
      <UPWaterfall
        columns={2}
        height={220}
        renderItem={({ item }) => (
          <UPCard customStyle={{ height: item.height, margin: 4 }} title={item.title}>
            <UPText text={`项目 ${item.id}`} />
          </UPCard>
        )}
        value={demoWaterfallItems}
      />

      {/* 树 Tree */}
      <Text style={styles.section}>树 Tree</Text>
      <UPTree
        data={demoTree}
        defaultExpandedKeys={['media']}
        height={160}
        renderNode={({ label, level }) => <UPText text={`${'  '.repeat(level)}${label}`} />}
        showCheckbox
      />

      {/* 拖拽排序 Dragsort */}
      <Text style={styles.section}>拖拽排序 Dragsort</Text>
      <UPDragsort
        initialList={demoDragRows}
        itemHeight={48}
        onDragEnd={() => UP.toast.default('排序完成')}
      />

      {/* 签名 Signature */}
      <Text style={styles.section}>签名 Signature</Text>
      <UPSignature
        canvasProps={{ canvasId: 'demo-signature' }}
        onConfirm={(result) => UP.toast.success(`签名: ${result.tempFilePath}`)}
      />

      {/* 虚拟列表 VirtualList */}
      <Text style={styles.section}>虚拟列表 VirtualList</Text>
      <UPVirtualList
        height={160}
        itemHeight={44}
        listData={demoVirtualRows}
        renderItem={({ item }) => <UPCell title={item.name} />}
      />

      {/* 下拉刷新 PullRefresh */}
      <Text style={styles.section}>下拉刷新 PullRefresh</Text>
      <UPPullRefresh
        height={120}
        onRefresh={() => UP.toast.default('刷新请求')}
        showLoadmore
      >
        <UPCell title="下拉刷新内容" value="向下拖拽" />
      </UPPullRefresh>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  section: {
    color: '#606266',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    color: '#303133',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
