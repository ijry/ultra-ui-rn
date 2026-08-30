/**
 * DemoPagesHost - 两级导航：分类 → 组件 → 演示页
 * 按 uview-plus 风格
 */
import React, { Suspense, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CATEGORIES,
  COMPONENTS,
  type ComponentCategory,
  type ComponentMeta,
  type CategoryMeta,
} from './registry';

// 页面状态
type ViewState =
  | { type: 'categories' }
  | { type: 'components'; category: CategoryMeta }
  | { type: 'demo'; component: ComponentMeta };

// 预加载所有演示组件
const DEMO_MODULES: Record<string, React.LazyExoticComponent<any>> = {};

// 创建懒加载组件
function createLazyDemo(componentId: string, category: ComponentCategory) {
  const key = `${category}/${componentId}`;
  if (!DEMO_MODULES[key]) {
    DEMO_MODULES[key] = React.lazy(() => {
      // 使用 switch 确保 Vite 能静态分析
      switch (category) {
        case 'basic':
          return import(`./components/basic/${componentId}Demo`);
        case 'form':
          return import(`./components/form/${componentId}Demo`);
        case 'navigation':
          return import(`./components/navigation/${componentId}Demo`);
        case 'display':
          return import(`./components/display/${componentId}Demo`);
        case 'feedback':
          return import(`./components/feedback/${componentId}Demo`);
        case 'advanced':
          return import(`./components/advanced/${componentId}Demo`);
        case 'layout':
          return import(`./components/layout/${componentId}Demo`);
        default:
          throw new Error(`Unknown category: ${category}`);
      }
    });
  }
  return DEMO_MODULES[key];
}

// 加载状态
function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3c9cff" />
      <Text style={styles.loadingText}>加载中...</Text>
    </View>
  );
}

export function DemoPagesHost() {
  const [view, setView] = useState<ViewState>({ type: 'categories' });

  // 返回上一级
  const goBack = () => {
    if (view.type === 'demo') {
      setView({ type: 'components', category: (view as any).category });
    } else {
      setView({ type: 'categories' });
    }
  };

  // 渲染分类列表
  if (view.type === 'categories') {
    return (
      <ScrollView contentContainerStyle={styles.indexBody} style={styles.fill}>
        <Text style={styles.indexTitle}>组件示例</Text>
        <Text style={styles.indexHint}>
          共 {COMPONENTS.length} 个组件，分 {CATEGORIES.length} 个分类
        </Text>

        {CATEGORIES.map(cat => {
          const count = COMPONENTS.filter(c => c.category === cat.id).length;
          return (
            <Pressable
              key={cat.id}
              accessibilityRole="button"
              onPress={() => setView({ type: 'components', category: cat })}
              style={styles.groupCard}
              testID={`category-${cat.id}`}
            >
              <View style={styles.groupHeader}>
                <Text style={styles.groupIcon}>{cat.icon}</Text>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupTitle}>{cat.title}</Text>
                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {cat.description}
                  </Text>
                </View>
                <Text style={styles.groupArrow}>›</Text>
              </View>
              <View style={styles.componentList}>
                {COMPONENTS.filter(c => c.category === cat.id)
                  .slice(0, 6)
                  .map(comp => (
                    <Text key={comp.id} style={styles.componentTag}>
                      {comp.title.split(' ')[0]}
                    </Text>
                  ))}
                {count > 6 && (
                  <Text style={styles.moreTag}>+{count - 6}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  // 渲染组件列表
  if (view.type === 'components') {
    const category = view.category;
    const components = COMPONENTS.filter(c => c.category === category.id);

    return (
      <View style={styles.fill}>
        {/* 顶栏 */}
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backText}>← 返回</Text>
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>
            {category.title}
          </Text>
          <Text style={styles.topHint}>{components.length} 个组件</Text>
        </View>

        {/* 组件列表 */}
        <ScrollView contentContainerStyle={styles.componentGrid} style={styles.fill}>
          {components.map(comp => (
            <Pressable
              key={comp.id}
              accessibilityRole="button"
              onPress={() => setView({ type: 'demo', component: comp })}
              style={styles.componentCard}
              testID={`component-${comp.id}`}
            >
              <Text style={styles.componentName}>{comp.title.split(' ')[0]}</Text>
              <Text style={styles.componentNameCn} numberOfLines={1}>
                {comp.title.split(' ')[1] || ''}
              </Text>
              <Text style={styles.componentDesc} numberOfLines={2}>
                {comp.description}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // 渲染组件演示
  if (view.type === 'demo') {
    const component = view.component;
    const Demo = createLazyDemo(component.id, component.category);

    return (
      <View style={styles.fill}>
        {/* 顶栏 */}
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backText}>← 返回</Text>
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>
            {component.title}
          </Text>
          <Text style={styles.topHint}>Props / Events</Text>
        </View>

        {/* 演示内容 */}
        <ScrollView contentContainerStyle={styles.demoBody} style={styles.fill}>
          <Suspense fallback={<LoadingFallback />}>
            <Demo {...{ onBack: goBack } as any} />
          </Suspense>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  backBtn: { paddingRight: 12 },
  backText: { color: '#3c9cff', fontSize: 14 },
  componentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    width: '48%',
  },
  componentDesc: {
    color: '#909399',
    fontSize: 11,
    marginTop: 4,
  },
  componentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
  },
  componentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  componentTag: {
    backgroundColor: '#f0f2f5',
    borderRadius: 3,
    color: '#606266',
    fontSize: 10,
    marginRight: 4,
    marginBottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  demoBody: {
    backgroundColor: '#f7f8fa',
    padding: 16,
    paddingBottom: 56,
  },
  fill: { flex: 1 },
  groupArrow: {
    color: '#909399',
    fontSize: 20,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
  },
  groupDescription: {
    color: '#909399',
    fontSize: 12,
    marginTop: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    color: '#3c9cff',
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  groupInfo: { flex: 1 },
  groupTitle: {
    color: '#303133',
    fontSize: 16,
    fontWeight: '600',
  },
  indexBody: {
    backgroundColor: '#f5f7fa',
    paddingBottom: 48,
  },
  indexHint: {
    color: '#909399',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  indexTitle: {
    color: '#303133',
    fontSize: 22,
    fontWeight: '700',
    padding: 16,
    paddingBottom: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#909399',
    marginTop: 8,
  },
  moreTag: {
    backgroundColor: '#e4e7ed',
    borderRadius: 3,
    color: '#909399',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  componentName: {
    color: '#303133',
    fontSize: 14,
    fontWeight: '600',
  },
  componentNameCn: {
    color: '#606266',
    fontSize: 12,
    marginTop: 2,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topHint: {
    color: '#909399',
    fontSize: 11,
    maxWidth: 80,
  },
  topTitle: {
    color: '#303133',
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
