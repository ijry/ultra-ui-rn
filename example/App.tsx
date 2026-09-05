import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  UPRoot,
  UPStatusBar,
  UPTabbar,
  UPTabbarItem,
  UPSafeBottom,
} from 'ultra-ui-rn';
import { DemoPagesHost, TemplatePagesHost } from './pages';
import { MinePage } from './pages/pages-example';

/**
 * Tabbar 照抄上游 `pages.json` 的 tabBar：组件 / 模板 / 我的，默认停在组件。
 * 上游那份配置里还有一条 `js 工具` 被注释掉了，所以只有三项。
 */
function App() {
  const [activeTab, setActiveTab] = useState<string | number>('components');

  return (
    <UPRoot>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        <UPStatusBar bgColor="#f3f4f6" />

        {activeTab === 'components' ? <DemoPagesHost /> : null}
        {activeTab === 'template' ? <TemplatePagesHost /> : null}
        {activeTab === 'mine' ? (
          <ScrollView contentContainerStyle={styles.mine} style={styles.fill}>
            <MinePage />
          </ScrollView>
        ) : null}

        <UPTabbar fixed={false} onChange={setActiveTab} value={activeTab}>
          <UPTabbarItem activeIcon="grid-fill" icon="grid" name="components" text="组件" />
          <UPTabbarItem activeIcon="photo-fill" icon="photo" name="template" text="模板" />
          <UPTabbarItem activeIcon="account-fill" icon="account" name="mine" text="我的" />
        </UPTabbar>

        <UPSafeBottom />
      </View>
    </UPRoot>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  mine: { backgroundColor: '#f5f7fa', paddingBottom: 48 },
  page: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
});

export default App;
