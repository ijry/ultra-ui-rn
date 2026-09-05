/**
 * DemoPagesHost
 *
 * 首页是**单页平铺**，不是两级下钻 —— 上游 `pages/example/components.nvue` 就是
 * 一页 7 个 `up-cell-group` 依次列完全部条目，分组顺序、条目顺序、标签、icon 都
 * 照抄 `SOURCE_GROUPS`。页尾也复刻上游的 gap + alert。
 */
import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { UPAlert, UPCell, UPCellGroup, UPGap, UPIcon } from 'ultra-ui-rn';
import {
  COMPONENTS,
  SOURCE_GROUPS,
  type ComponentCategory,
  type ComponentMeta,
} from './registry';
import { DemoScrollContext } from './components/_shared';
import * as advanced from './components/advanced';
import * as basic from './components/basic';
import * as display from './components/display';
import * as feedback from './components/feedback';
import * as form from './components/form';
import * as layout from './components/layout';
import * as navigation from './components/navigation';

// 页面状态：上游首页无下钻，所以只有「索引」和「演示页」两态
type ViewState =
  | { type: 'index' }
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

/** 上游 components.nvue 里 page-nav 的 desc 原文 */
const PAGE_DESC =
  'uview-plus 是uview2.0的vue3版本，是全面兼容nvue/鸿蒙/uni-app-x(已发布)的uni-app生态框架，全面的组件和便捷的工具会让您信手拈来，如鱼得水。';

const BY_ID = new Map(COMPONENTS.map((c) => [c.id, c]));

export function DemoPagesHost() {
  const [view, setView] = useState<ViewState>({ type: 'index' });
  const demoScrollRef = useRef<ScrollView>(null);

  const goBack = () => setView({ type: 'index' });

  // 首页：单页平铺，分组与顺序照抄上游索引
  if (view.type === 'index') {
    return (
      <ScrollView style={s.fill} contentContainerStyle={s.page}>
        <View style={s.nav}>
          <Text style={s.navTitle}>ultra-ui-rn</Text>
          <Text style={s.navDesc}>{PAGE_DESC}</Text>
        </View>

        {SOURCE_GROUPS.map((group) => (
          <UPCellGroup key={group.groupName} title={group.groupName} titleBgColor="rgb(243, 244, 246)">
            {group.items.map((item) => {
              const comp = item.id ? BY_ID.get(item.id) : undefined;
              return (
                <UPCell
                  disabled={!comp}
                  isLink={Boolean(comp)}
                  key={item.title}
                  // 上游用 /static/uview/demo/<icon>.png 作行首图标，那批 PNG 没有随
                  // demo 源码一起进仓库（只有图标字体进来了），所以这里不放图标；
                  // icon 名仍保留在 SOURCE_GROUPS 里，assets 补齐后可直接接上。
                  label={comp ? undefined : '暂无本地 demo'}
                  onClick={comp ? () => setView({ type: 'demo', component: comp }) : undefined}
                  title={item.title}
                  titleStyle={s.cellTitle}
                />
              );
            })}
          </UPCellGroup>
        ))}

        <UPGap height={30} />
        <UPAlert description="uview-plus 2022-2024" />
        <UPGap height={30} />
      </ScrollView>
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
          The single scroller for demo pages. `DemoPage` is a plain View and the
          pages that manage their own scrolling are the exception, so this is the
          one place vertical scrolling happens — and its ref is shared through
          DemoScrollContext for pages that need `scrollTo` (UPParse anchors).
        */}
        <ScrollView contentContainerStyle={s.demoBody} ref={demoScrollRef} style={s.fill}>
          <DemoScrollContext.Provider value={demoScrollRef}>
            {Demo ? <Demo /> : <MissingDemo category={component.category} componentId={component.id} />}
          </DemoScrollContext.Provider>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  backBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  cellTitle: { fontWeight: '500' },
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
  nav: { backgroundColor: '#ffffff', paddingBottom: 16, paddingHorizontal: 16, paddingTop: 12 },
  navDesc: { color: '#909399', fontSize: 13, lineHeight: 20 },
  navTitle: { color: '#303133', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  page: { backgroundColor: '#f5f7fa', paddingBottom: 48 },
  topBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  topTitle: {
    color: '#303133',
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});
