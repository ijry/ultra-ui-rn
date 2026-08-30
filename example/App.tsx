import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  UPRoot,
  UPStatusBar,
  UPTabbar,
  UPTabbarItem,
  UPSafeBottom,
} from 'ultra-ui-rn';
import { DemoPagesHost } from './pages';

function App() {
  const [activeTab, setActiveTab] = useState<string | number>('pages');

  return (
    <UPRoot>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        <UPStatusBar bgColor="#f3f4f6" />

        {activeTab === 'pages' ? (
          <DemoPagesHost />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {activeTab === 'home' ? '首页' : '收藏'}
            </Text>
          </View>
        )}

        <UPTabbar fixed={false} onChange={setActiveTab} value={activeTab}>
          <UPTabbarItem activeIcon="home-fill" icon="home" name="home" text="首页" />
          <UPTabbarItem badge={2} icon="star" name="favorites" text="收藏" />
          <UPTabbarItem activeIcon="grid-fill" icon="grid" name="pages" text="组件" />
        </UPTabbar>

        <UPSafeBottom />
      </View>
    </UPRoot>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  placeholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#909399',
    fontSize: 16,
  },
});

export default App;
