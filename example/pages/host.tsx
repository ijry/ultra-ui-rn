/**
 * P47 — DemoPagesHost: a navigable page set replicating the uview-plus demo
 * app's `src/pages/` (30 pages). Renders a grouped index; opening a page
 * swaps to it with a back bar (state-based stack, no nav dependency).
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEMO_GROUPS, DEMO_PAGES, type DemoPageId } from './registry';
import type { DemoPageProps } from './types';
import * as ComponentsPages from './pages-components';
import * as ExamplePages from './pages-example';
import * as TemplatePages from './pages-template';

const PAGE_COMPONENTS: Record<DemoPageId, React.ComponentType<DemoPageProps>> = {
  // componentsA–D
  test: ComponentsPages.TestPage,
  card: ComponentsPages.CardPage,
  'parse-jump': ComponentsPages.ParseJumpPage,
  tabbar2: ComponentsPages.Tabbar2Page,
  guide: ComponentsPages.GuidePage,
  popover: ComponentsPages.PopoverPage,
  steps: ComponentsPages.StepsPage,
  tooltip: ComponentsPages.TooltipPage,
  cateTab: ComponentsPages.CateTabPage,
  dragsort: ComponentsPages.DragsortPage,
  pullRefresh: ComponentsPages.PullRefreshPage,
  select: ComponentsPages.SelectPage,
  // example
  ad: ExamplePages.AdPage,
  mine: ExamplePages.MinePage,
  template: ExamplePages.TemplateIndexPage,
  // template
  'address-index': TemplatePages.AddressIndexPage,
  'address-addSite': TemplatePages.AddressAddSitePage,
  citySelect: TemplatePages.CitySelectPage,
  'comment-index': TemplatePages.CommentIndexPage,
  'comment-reply': TemplatePages.CommentReplyPage,
  coupon: TemplatePages.CouponPage,
  keyboardPay: TemplatePages.KeyboardPayPage,
  'login-index': TemplatePages.LoginIndexPage,
  'login-code': TemplatePages.LoginCodePage,
  mallMenu1: TemplatePages.MallMenu1Page,
  mallMenu2: TemplatePages.MallMenu2Page,
  order: TemplatePages.OrderPage,
  submitBar: TemplatePages.SubmitBarPage,
  wxCenter: TemplatePages.WxCenterPage,
};

export function DemoPagesHost() {
  const [current, setCurrent] = useState<DemoPageId | null>(null);
  const open = useMemo(() => (id: DemoPageId) => setCurrent(id), []);
  const meta = current ? DEMO_PAGES.find((page) => page.id === current) : null;

  if (current && meta) {
    const Page = PAGE_COMPONENTS[current];
    return (
      <View style={styles.fill}>
        <View style={styles.backBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCurrent(null)}
            style={styles.backButton}
            testID="demo-pages-back"
          >
            <Text style={styles.backText}>‹ 返回列表</Text>
          </Pressable>
          <Text style={styles.backTitle} numberOfLines={1}>
            {meta.title}
          </Text>
          <Text style={styles.sourceText} numberOfLines={1}>
            {meta.source}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.pageBody} style={styles.fill}>
          <Page open={open} />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.indexBody} style={styles.fill}>
      <Text style={styles.indexTitle}>uview-plus 示例页复刻（P47）</Text>
      <Text style={styles.indexHint}>
        源仓库 ijry/uview-plus@3.x src/pages/ 共 29 个可导航页，全部用 UP 组件复刻。
      </Text>
      {DEMO_GROUPS.map((group) => {
        const pages = DEMO_PAGES.filter((page) => page.group === group.id);
        if (pages.length === 0) return null;
        return (
          <View key={group.id} style={styles.group}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            {pages.map((page) => (
              <Pressable
                accessibilityRole="button"
                key={page.id}
                onPress={() => setCurrent(page.id)}
                style={styles.row}
                testID={`demo-page-${page.id}`}
              >
                <Text style={styles.rowTitle}>{page.title}</Text>
                <Text style={styles.rowSource} numberOfLines={1}>
                  {page.source}
                </Text>
                <Text style={styles.rowArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    paddingRight: 8,
  },
  backText: {
    color: '#3c9cff',
    fontSize: 14,
  },
  backTitle: {
    color: '#303133',
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  fill: {
    flex: 1,
  },
  group: {
    marginBottom: 18,
  },
  groupTitle: {
    backgroundColor: '#f3f4f6',
    color: '#909399',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  indexBody: {
    backgroundColor: '#ffffff',
    paddingBottom: 48,
  },
  indexHint: {
    color: '#909399',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  indexTitle: {
    color: '#303133',
    fontSize: 20,
    fontWeight: '700',
    padding: 12,
  },
  pageBody: {
    backgroundColor: '#f7f8fa',
    padding: 16,
    paddingBottom: 56,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: '#ebeef5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  rowArrow: {
    color: '#c0c4cc',
    fontSize: 18,
    marginLeft: 8,
  },
  rowSource: {
    color: '#c0c4cc',
    flex: 1,
    fontSize: 11,
    marginLeft: 10,
    textAlign: 'right',
  },
  rowTitle: {
    color: '#303133',
    fontSize: 15,
  },
  sourceText: {
    color: '#c0c4cc',
    fontSize: 10,
    maxWidth: 130,
  },
});
