/**
 * 组件示例页 - 反馈组件
 * Toast、通知、弹窗、模态框、操作面板、加载、提示
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  UP,
  UPButton,
  UPToast,
  UPNotify,
  UPPopup,
  UPModal,
  UPActionSheet,
  UPLoadingPage,
  UPGuide,
  UPSafeBottom,
  UPNoNetwork,
  UPFloatButton,
  UPText,
} from 'ultra-ui-rn';

export default function FeedbackPage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [connected, setConnected] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>反馈组件</Text>

      {/* Toast */}
      <Text style={styles.section}>Toast 轻提示</Text>
      <UPButton text="成功" onClick={() => UP.toast.success('保存成功')} />
      <UPButton text="失败" type="warning" onClick={() => UP.toast.error('操作失败')} />

      {/* Notify */}
      <Text style={styles.section}>Notify 通知</Text>
      <UPButton
        text="通知"
        type="warning"
        onClick={() => UP.notify.warning('网络较慢')}
      />
      <UPNotify duration={0} message="声明式通知" show />

      {/* Popup */}
      <Text style={styles.section}>Popup 弹出层</Text>
      <UPButton text="打开弹窗" type="primary" onClick={() => setPopupOpen(true)} />
      <UPPopup show={popupOpen} onChangeShow={setPopupOpen} closeable>
        <View style={styles.popupContent}>
          <UPText text="弹窗内容通过 UPRoot 渲染。" />
        </View>
      </UPPopup>

      {/* Modal */}
      <Text style={styles.section}>Modal 模态框</Text>
      <UPButton text="模态框" onClick={() => setModalOpen(true)} />
      <UPModal
        content="这是源兼容模态框。"
        onChangeShow={setModalOpen}
        onConfirm={() => UP.toast.success('已确认')}
        show={modalOpen}
        showCancelButton
        title="确认操作"
      />

      {/* ActionSheet */}
      <Text style={styles.section}>ActionSheet 操作面板</Text>
      <UPButton text="操作面板" onClick={() => setSheetOpen(true)} />
      <UPActionSheet
        actions={[{ name: '分享' }, { name: '归档' }]}
        cancelText="取消"
        onChangeShow={setSheetOpen}
        onSelect={(action) => UP.toast.primary(String(action.name))}
        show={sheetOpen}
      />

      {/* Loading */}
      <Text style={styles.section}>LoadingPage 页面加载</Text>
      <UPButton
        text={loading ? '停止加载' : '加载页面'}
        type="success"
        onClick={() => setLoading((v) => !v)}
      />
      <UPLoadingPage loading={loading} loadingText="加载中..." />

      {/* Guide */}
      <Text style={styles.section}>Guide 引导</Text>
      <UPButton text="打开引导" onClick={() => setGuideVisible(true)} />
      <UPGuide
        list={[
          { desc: '第一步', title: '引导1' },
          { desc: '第二步', title: '引导2' },
        ]}
        onUpdateShow={setGuideVisible}
        show={guideVisible}
        storageKey="example-guide"
      />

      {/* NoNetwork */}
      <Text style={styles.section}>NoNetwork 断网提示</Text>
      <UPButton
        plain
        text="模拟断网"
        onClick={() => setConnected(false)}
      />
      <UPNoNetwork connected={connected} onRetry={() => setConnected(true)} />

      {/* FloatButton */}
      <Text style={styles.section}>FloatButton 悬浮按钮</Text>
      <UPFloatButton
        isMenu
        list={[{ name: 'edit' }, { name: 'share' }]}
        onItemClick={(item) => UP.toast.default(`操作: ${item.name}`)}
      />
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
  popupContent: {
    padding: 24,
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
