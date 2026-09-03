/**
 * DemoPagesHost - uview-plus 风格两级导航
 * 分类列表用 UPCellGroup/UPCell，图标用 UPIcon
 */
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { UPCell, UPCellGroup, UPIcon } from 'ultra-ui-rn';
import {
  CATEGORIES,
  COMPONENTS,
  type ComponentCategory,
  type ComponentMeta,
  type CategoryMeta,
} from './registry';
import * as advanced from './components/advanced';
import * as basic from './components/basic';
import * as display from './components/display';
import * as feedback from './components/feedback';
import * as form from './components/form';
import * as layout from './components/layout';
import * as navigation from './components/navigation';

// 页面状态
type ViewState =
  | { type: 'categories' }
  | { type: 'components'; category: CategoryMeta }
  | { type: 'demo'; component: ComponentMeta };

type DemoComponent = React.ComponentType<Record<string, never>>;

/**
 * Static per-category module map. Metro cannot resolve `import()` with a
 * template literal, so the demo pages must be reachable through static
 * imports — and an RN bundle is monolithic anyway, so lazy loading bought
 * nothing here.
 */
const DEMOS: Record<ComponentCategory, Record<string, unknown>> = {
  advanced,
  basic,
  display,
  feedback,
  form,
  layout,
  navigation,
};

function resolveDemo(componentId: string, category: ComponentCategory): DemoComponent | null {
  const found = DEMOS[category]?.[`${componentId}Demo`];
  return typeof found === 'function' ? (found as DemoComponent) : null;
}

function MissingDemo({ componentId, category }: { componentId: string; category: string }) {
  return (
    <View style={s.loadingContainer}>
      <Text style={s.loadingText}>{`未找到 ${category}/${componentId}Demo`}</Text>
    </View>
  );
}

export function DemoPagesHost() {
  const [view, setView] = useState<ViewState>({ type: 'categories' });

  const goBack = () => {
    if (view.type === 'demo') {
      const cat = CATEGORIES.find((c) => c.id === view.component.category);
      if (cat) setView({ type: 'components', category: cat });
      else setView({ type: 'categories' });
    } else {
      setView({ type: 'categories' });
    }
  };

  // 分类列表（uview-plus cell-group 风格）
  if (view.type === 'categories') {
    return (
      <ScrollView style={s.fill} contentContainerStyle={s.page}>
        <Text style={s.pageTitle}>组件示例</Text>
        <UPCellGroup border>
          {CATEGORIES.map((cat) => {
            const count = COMPONENTS.filter((c) => c.category === cat.id).length;
            return (
              <UPCell
                key={cat.id}
                title={cat.title}
                label={`${count} 个组件`}
                icon={cat.icon}
                isLink
                onClick={() => setView({ type: 'components', category: cat })}
              />
            );
          })}
        </UPCellGroup>
      </ScrollView>
    );
  }

  // 组件列表
  if (view.type === 'components') {
    const category = view.category;
    const components = COMPONENTS.filter((c) => c.category === category.id);

    return (
      <View style={s.fill}>
        <View style={s.topBar}>
          <Pressable onPress={goBack} style={s.backBtn}>
            <UPIcon name="arrow-left" customPrefix="uicon" size={16} color="#3c9cff" />
          </Pressable>
          <Text style={s.topTitle} numberOfLines={1}>
            {category.title}
          </Text>
          <Text style={s.topHint}>{components.length}</Text>
        </View>

        <ScrollView style={s.fill}>
          <UPCellGroup border>
            {components.map((comp) => (
              <UPCell
                key={comp.id}
                title={comp.title.split(' ')[0]}
                label={comp.title.split(' ')[1] || ''}
                isLink
                onClick={() => setView({ type: 'demo', component: comp })}
              />
            ))}
          </UPCellGroup>
        </ScrollView>
      </View>
    );
  }

  // 演示页
  if (view.type === 'demo') {
    const component = view.component;
    const Demo = resolveDemo(component.id, component.category);

    return (
      <View style={s.fill}>
        <View style={s.topBar}>
          <Pressable onPress={goBack} style={s.backBtn}>
            <UPIcon name="arrow-left" customPrefix="uicon" size={16} color="#3c9cff" />
          </Pressable>
          <Text style={s.topTitle} numberOfLines={1}>
            {component.title}
          </Text>
        </View>

        {/*
          Deliberately a View, not a ScrollView: every demo page brings its own
          scroller (`DemoPage`, or its own ScrollView/FlashList). Wrapping them in
          another one nested two scrollers, and the inner one then had no
          scrollable extent — which silently broke anything calling `scrollTo`,
          e.g. UPParse's `navigateTo` anchor jumps.
        */}
        <View style={[s.fill, s.demoBody]}>
          {Demo ? <Demo /> : <MissingDemo category={component.category} componentId={component.id} />}
        </View>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  backBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  demoBody: {
    backgroundColor: '#f7f8fa',
    paddingBottom: 56,
  },
  fill: { flex: 1 },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: { color: '#909399', marginTop: 8 },
  page: { backgroundColor: '#f5f7fa', paddingBottom: 48 },
  pageTitle: {
    color: '#303133',
    fontSize: 22,
    fontWeight: '700',
    padding: 16,
    paddingBottom: 8,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  topHint: {
    color: '#909399',
    fontSize: 13,
    paddingRight: 12,
  },
  topTitle: {
    color: '#303133',
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});
