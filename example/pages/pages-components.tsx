/**
 * P47 — Ports of the uview-plus demo pages under `src/pages/componentsA–D`
 * (12 pages). Each page mirrors the source demo's usage of the matching
 * UP component so behavior can be eyeballed side by side.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { UP, UPAlert } from 'ultra-ui-rn';
import { UPButton } from 'ultra-ui-rn';
import { UPCard } from 'ultra-ui-rn';
import { UPCateTab } from 'ultra-ui-rn';
import { UPDragsort } from 'ultra-ui-rn';
import { UPGuide, type UPGuideStorage } from 'ultra-ui-rn';
import { UPImage } from 'ultra-ui-rn';
import { UPList } from 'ultra-ui-rn';
import { UPListItem } from 'ultra-ui-rn';
import { UPPopover } from 'ultra-ui-rn';
import { UPPullRefresh } from 'ultra-ui-rn';
import { UPSelect } from 'ultra-ui-rn';
import { UPSteps } from 'ultra-ui-rn';
import { UPStepsItem } from 'ultra-ui-rn';
import { UPSubsection } from 'ultra-ui-rn';
import { UPTabbar } from 'ultra-ui-rn';
import { UPTabbarItem } from 'ultra-ui-rn';
import { UPTooltip } from 'ultra-ui-rn';
import { UPIcon } from 'ultra-ui-rn';
import type { DemoPageProps } from './types';

const DEMO_IMG = 'https://picsum.photos/seed/uview/300/300';

/* ------------------------------------------------------------------ */
/* componentsA/test — scrollable image list                            */
/* ------------------------------------------------------------------ */

export function TestPage(_props: DemoPageProps) {
  return (
    <UPList customStyle={{ backgroundColor: '#f56c6c', height: 500 }}>
      {Array.from({ length: 8 }, (_, index) => (
        <UPListItem key={index}>
          <UPImage height={160} src={DEMO_IMG} width="100%" />
        </UPListItem>
      ))}
    </UPList>
  );
}

/* ------------------------------------------------------------------ */
/* componentsB/card — basic + advanced card                            */
/* ------------------------------------------------------------------ */

export function CardPage(_props: DemoPageProps) {
  const [showThumb, setShowThumb] = useState(0);
  const [padding, setPadding] = useState(1);
  const [showFoot, setShowFoot] = useState(0);
  const [showBorder, setShowBorder] = useState(0);
  const paddings = ['10', '15', '20'];

  return (
    <View>
      <Text style={styles.blockTitle}>基础卡片</Text>
      <UPCard showHead={false}>
        <Text style={styles.cardBodyText}>
          尊敬的客户您好，您有来自的开票。如果有疑问请联系您的客户经理。
        </Text>
      </UPCard>
      <Text style={styles.blockTitle}>高级卡片</Text>
      <UPCard
        border={showBorder === 0}
        foot={showFoot === 0 ? <UPIcon label="30评论" name="chat" /> : undefined}
        onClick={() => UP.toast.default('card click')}
        onHeadClick={() => UP.toast.default('head click')}
        padding={Number(paddings[padding])}
        showHead
        subTitle="subtitle"
        thumb={showThumb === 0 ? DEMO_IMG : undefined}
        title="标题"
      >
        <View style={styles.cardBodyRow}>
          <Text style={[styles.cardBodyText, { flex: 1 }]}>
            瓶身描绘的牡丹一如你初妆，冉冉檀香透过窗心事我了然，宣纸上走笔至此搁一半
          </Text>
          <UPImage height={60} src={DEMO_IMG} width={80} />
        </View>
      </UPCard>
      <Text style={styles.blockTitle}>参数配置</Text>
      <Text style={styles.configTitle}>左上角图标</Text>
      <UPSubsection current={showThumb} list={[{ name: '显示' }, { name: '隐藏' }]} onChange={setShowThumb} />
      <Text style={styles.configTitle}>内边距</Text>
      <UPSubsection current={padding} list={paddings.map((name) => ({ name }))} onChange={setPadding} />
      <Text style={styles.configTitle}>底部</Text>
      <UPSubsection current={showFoot} list={[{ name: '显示' }, { name: '隐藏' }]} onChange={setShowFoot} />
      <Text style={styles.configTitle}>外边框</Text>
      <UPSubsection current={showBorder} list={[{ name: '显示' }, { name: '隐藏' }]} onChange={setShowBorder} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsB/parse/jump — navigation target page                     */
/* ------------------------------------------------------------------ */

export function ParseJumpPage(_props: DemoPageProps) {
  return <Text style={styles.jumpText}>跳转测试页面（源 componentsB/parse/jump.vue）</Text>;
}

/* ------------------------------------------------------------------ */
/* componentsB/tabbar/tabbar2 — tabbar variants                        */
/* ------------------------------------------------------------------ */

export function Tabbar2Page(_props: DemoPageProps) {
  const [value1, setValue1] = useState<string | number>('首页');
  const [value2, setValue2] = useState<string | number>('首页');
  const [value3, setValue3] = useState<string | number>('home');
  const [value4, setValue4] = useState<string | number>('首页');

  return (
    <View>
      <Text style={styles.blockTitle}>基础功能</Text>
      <UPTabbar
        fixed={false}
        onChange={setValue1}
        safeAreaInsetBottom={false}
        value={value1}
      >
        <UPTabbarItem icon="home" text="首页" />
        <UPTabbarItem icon="photo" text="放映厅" />
        <UPTabbarItem icon="play-right" text="直播" />
        <UPTabbarItem icon="account" text="我的" />
      </UPTabbar>
      <Text style={styles.blockTitle}>显示徽标</Text>
      <UPTabbar
        fixed={false}
        onChange={setValue2}
        safeAreaInsetBottom={false}
        value={value2}
      >
        <UPTabbarItem dot icon="home" text="首页" />
        <UPTabbarItem badge={3} icon="photo" text="放映厅" />
        <UPTabbarItem icon="play-right" text="直播" />
        <UPTabbarItem icon="account" text="我的" />
      </UPTabbar>
      <Text style={styles.blockTitle}>匹配标签的名称</Text>
      <UPTabbar
        fixed={false}
        onChange={setValue3}
        safeAreaInsetBottom={false}
        value={value3}
      >
        <UPTabbarItem icon="home" name="home" text="首页" />
        <UPTabbarItem icon="photo" name="photo" text="放映厅" />
        <UPTabbarItem icon="play-right" name="play-right" text="直播" />
        <UPTabbarItem icon="account" name="account" text="我的" />
      </UPTabbar>
      <Text style={styles.blockTitle}>自定义图标/颜色</Text>
      <UPTabbar
        activeColor="#d81e06"
        fixed={false}
        onChange={setValue4}
        safeAreaInsetBottom={false}
        value={value4}
      >
        <UPTabbarItem activeIcon="bell-fill" icon="bell" text="首页" />
        <UPTabbarItem activeIcon="photo-fill" icon="photo" text="放映厅" />
        <UPTabbarItem activeIcon="play-right-fill" icon="play-right" text="直播" />
        <UPTabbarItem activeIcon="account-fill" icon="account" text="我的" />
      </UPTabbar>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsC/guide — first-run guide                                 */
/* ------------------------------------------------------------------ */

export function GuidePage(_props: DemoPageProps) {
  const [show, setShow] = useState(false);
  const [storageVersion, setStorageVersion] = useState(0);
  const storage = useMemo<UPGuideStorage>(() => {
    const values: Record<string, string> = {};
    return {
      getItem: async (key: string) => values[key],
      removeItem: async (key: string) => {
        delete values[key];
      },
      setItem: async (key: string, value: string) => {
        values[key] = value;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageVersion]);

  return (
    <View>
      <View style={styles.rowGap}>
        <UPButton text="重新打开引导" type="primary" onClick={() => setShow(true)} />
        <UPButton
          text="重置首次标记"
          onClick={() => {
            setStorageVersion((value) => value + 1);
            UP.toast.default('已重置');
          }}
        />
      </View>
      <UPGuide
        list={[
          {
            title: '欢迎使用 uview-plus',
            desc: '一套跨端可复用的高质量组件库。',
          },
          {
            title: '引导页支持多页滑动',
            desc: '可配置跳过、下一步和立即体验。',
          },
          {
            title: '只显示一次',
            desc: '默认内置本地存储记忆能力。',
          },
        ]}
        onChange={(event) => UP.toast.default(`guide change: ${event.current}`)}
        onFinish={() => setShow(false)}
        onSkip={() => setShow(false)}
        show={show}
        storage={storage}
        storageKey="demo-up-guide-once"
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsC/popover — left/right popovers                           */
/* ------------------------------------------------------------------ */

export function PopoverPage(_props: DemoPageProps) {
  return (
    <View>
      <Text style={styles.blockTitle}>右侧弹出</Text>
      <UPPopover
        bgColor="#e3e4e6"
        color="#333333"
        direction="right"
        popupBgColor="#f7f7f7"
        trigger={<UPButton text="点击" type="primary" />}
        content={<Text style={styles.popoverContent}>自定义内容</Text>}
      />
      <Text style={styles.blockTitle}>左侧弹出及强制定位</Text>
      <View style={styles.rowEnd}>
        <UPPopover
          bgColor="#333333"
          color="#ffffff"
          direction="left"
          forcePosition={{ right: '108px', top: '0px' }}
          popupBgColor="#333333"
          trigger={<UPButton text="点击" type="primary" />}
          content={<Text style={styles.popoverContent}>自定义内容</Text>}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsC/steps — steps variants                                  */
/* ------------------------------------------------------------------ */

const ORDER_STEPS = [
  { title: '已下单', desc: '10:30' },
  { title: '已出库', desc: '10:35' },
  { title: '运输中', desc: '11:40' },
  { title: '已签收', desc: '19:50' },
  { title: '已拒收', desc: '20:10' },
  { title: '已退回', desc: '23:20' },
];

export function StepsPage(_props: DemoPageProps) {
  return (
    <View>
      <Text style={styles.blockTitle}>基础演示</Text>
      <UPSteps current={1}>
        {ORDER_STEPS.map((step) => (
          <UPStepsItem desc={step.desc} key={step.title} title={step.title} />
        ))}
      </UPSteps>
      <Text style={styles.blockTitle}>显示点类型</Text>
      <UPSteps current={1} dot>
        <UPStepsItem desc="10:30" title="已下单" />
        <UPStepsItem desc="10:35" title="已出库" />
        <UPStepsItem desc="11:40" title="运输中" />
      </UPSteps>
      <UPSteps current={1} direction="column" dot>
        <UPStepsItem desc="10:30" title="已下单" />
        <UPStepsItem desc="10:35" title="已出库" />
        <UPStepsItem desc="11:40" title="运输中" />
      </UPSteps>
      <Text style={styles.blockTitle}>错误状态</Text>
      <UPSteps current={1}>
        <UPStepsItem desc="10:30" title="已下单" />
        <UPStepsItem desc="10:35" error title="仓库着火" />
        <UPStepsItem desc="11:40" title="破产清算" />
      </UPSteps>
      <Text style={styles.blockTitle}>自定义图标</Text>
      <UPSteps activeIcon="checkmark" current={1} inactiveIcon="arrow-right">
        <UPStepsItem desc="10:30" title="已下单" />
        <UPStepsItem desc="10:35" title="已出库" />
        <UPStepsItem desc="11:40" title="运输中" />
      </UPSteps>
      <Text style={styles.blockTitle}>自定义插槽</Text>
      <UPSteps current={1}>
        <UPStepsItem desc="10:30" title="已下单" />
        <UPStepsItem desc="10:35" title="已出库" />
        <UPStepsItem
          desc="11:40"
          iconNode={<Text style={styles.slotIcon}>运</Text>}
          title="运输中"
        />
      </UPSteps>
      <Text style={styles.blockTitle}>自定义颜色</Text>
      <UPSteps activeColor="#3c9cff" current={1}>
        <UPStepsItem desc="10:30" title="已下单" />
        <UPStepsItem desc="10:35" title="已出库" />
        <UPStepsItem desc="11:40" title="运输中" />
      </UPSteps>
      <Text style={styles.blockTitle}>竖向展示</Text>
      <UPSteps current={1} direction="column">
        <UPStepsItem desc="10:30" title="已下单" />
        <UPStepsItem desc="10:35" title="已出库" />
        <UPStepsItem desc="11:40" title="运输中" />
      </UPSteps>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsC/tooltip — tooltip variants                              */
/* ------------------------------------------------------------------ */

export function TooltipPage(_props: DemoPageProps) {
  const text1 = '长按文本，上方提示';
  const text2 = '长按文本，下方提示';
  const text3 = '显示多个扩展按钮';
  const text4 = '自动调整气泡位置';
  const text5 = '长按文本，显示背景色';
  return (
    <View>
      <Text style={styles.blockTitle}>基础使用</Text>
      <UPTooltip overlay text={text1} />
      <Text style={styles.blockTitle}>下方显示</Text>
      <UPTooltip direction="bottom" text={text2} />
      <Text style={styles.blockTitle}>扩展按钮</Text>
      <UPTooltip buttons={['扩展']} onClick={(index) => UP.toast.default(`tooltip btn ${index}`)} text={text3} />
      <Text style={styles.blockTitle}>自动调整位置</Text>
      <UPTooltip buttons={['扩展', '搜索', '翻译']} text={text4} />
      <Text style={styles.blockTitle}>高亮选中文本背景色</Text>
      <UPTooltip bgColor="#e3e4e6" buttons={['扩展', '搜索', '翻译']} direction="top" text={text5} triggerMode="click" />
      <Text style={styles.blockTitle}>单例打开</Text>
      <View style={styles.rowGap}>
        <UPTooltip singleton text="第一个" triggerMode="click" />
        <UPTooltip singleton text="第二个" triggerMode="click" />
      </View>
      <Text style={styles.blockTitle}>自定义触发器</Text>
      <UPTooltip
        bgColor="#e3e4e6"
        color="#333333"
        direction="right"
        popupBgColor="#f7f7f7"
        text={text5}
        trigger={<UPButton text="点击" type="primary" />}
        triggerMode="click"
      />
      <Text style={styles.blockTitle}>左侧弹出</Text>
      <View style={styles.rowEnd}>
        <UPTooltip
          bgColor="#333333"
          color="#ffffff"
          direction="left"
          forcePosition={{ right: '108px', top: '0px' }}
          popupBgColor="#333333"
          text={text5}
          trigger={<UPButton text="点击" type="primary" />}
          triggerMode="click"
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsD/cateTab — category tab with async data                  */
/* ------------------------------------------------------------------ */

export function CateTabPage(_props: DemoPageProps) {
  const [tabList, setTabList] = useState<readonly Record<string, unknown>[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTabList([
        { title: '选项一', children: [{ title: '水煮肉片', cover: DEMO_IMG, price: 88 }] },
        { title: '选项二', children: [{ title: '酸菜鱼', cover: DEMO_IMG, price: 99 }] },
        { title: '选项三', children: [{ title: '回锅肉', cover: DEMO_IMG, price: 68 }] },
        { title: '选项四', children: [{ title: '麻辣香锅', cover: DEMO_IMG, price: 128 }] },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View>
      <View style={styles.cateBanner} />
      <UPCateTab
        height={440}
        itemKeyName="title"
        mode="follow"
        renderPageItem={({ item }) => (
          <View style={styles.cateRow}>
            <UPImage height={60} src={String(item.cover ?? DEMO_IMG)} width={80} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cateTitle}>{String(item.title)}</Text>
              <Text style={styles.catePrice}>￥{Number(item.price)}</Text>
            </View>
          </View>
        )}
        tabKeyName="title"
        tabList={tabList}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsD/dragsort — drag sort variants                           */
/* ------------------------------------------------------------------ */

const DRAG_ITEMS = [
  { id: 1, label: '项目 A' },
  { id: 2, label: '项目 B' },
  { id: 3, label: '项目 C' },
  { id: 4, label: '项目 D' },
  { id: 5, label: '项目 E' },
  { id: 6, label: '项目 F' },
  { id: 7, label: '项目 G' },
  { id: 8, label: '项目 H' },
];

const DRAG_ITEMS_H = DRAG_ITEMS.map((item) => ({ ...item, label: `横向 ${item.label.slice(-1)}` }));

export function DragsortPage(_props: DemoPageProps) {
  return (
    <View>
      <UPAlert description="PC端查看时需要触摸仿真模式才会正确计算位置" showIcon={false} />
      <Text style={styles.blockTitle}>单列多行模式</Text>
      <UPDragsort
        initialList={DRAG_ITEMS}
        onDragEnd={(list) => UP.toast.default(`拖拽结束: ${list.length} 项`)}
        renderItem={({ index, item }) => (
          <View style={styles.dragItem}>
            <Text>序号：{Number(index) + 1} - {String(item.label)}</Text>
          </View>
        )}
      />
      <Text style={styles.blockTitle}>自定义拖动句柄</Text>
      <UPDragsort
        initialList={DRAG_ITEMS}
        onDragEnd={(list) => UP.toast.default(`拖拽结束: ${list.length} 项`)}
        renderHandler={() => <View style={styles.dragHandler} />}
        renderItem={({ index, item }) => (
          <View style={styles.dragItem}>
            <Text>序号：{Number(index) + 1} - {String(item.label)}</Text>
          </View>
        )}
      />
      <Text style={styles.blockTitle}>多行多列模式</Text>
      <UPDragsort
        columns={3}
        direction="all"
        draggable
        initialList={DRAG_ITEMS}
        onDragEnd={(list) => UP.toast.default(`拖拽结束: ${list.length} 项`)}
        renderItem={({ item }) => <View style={styles.dragItemH}><Text>{String(item.label)}</Text></View>}
      />
      <Text style={styles.blockTitle}>单行横向拖动</Text>
      <UPDragsort
        direction="horizontal"
        draggable
        initialList={DRAG_ITEMS_H}
        onDragEnd={(list) => UP.toast.default(`拖拽结束: ${list.length} 项`)}
        renderItem={({ item }) => <View style={styles.dragItemH}><Text>{String(item.label)}</Text></View>}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsD/pullRefresh — pull to refresh                           */
/* ------------------------------------------------------------------ */

export function PullRefreshPage(_props: DemoPageProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<readonly string[]>(
    Array.from({ length: 12 }, (_, index) => `列表项 ${index + 1}`),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRows(Array.from({ length: 12 }, (_, index) => `刷新后的列表项 ${index + 1}`));
      setRefreshing(false);
    }, 1200);
  };

  return (
    <View>
      <UPAlert description="下拉触发刷新" showIcon={false} />
      <Text style={styles.blockTitle}>基本使用</Text>
      <UPPullRefresh height={320} onRefresh={onRefresh} refreshing={refreshing} threshold={50}>
        <View style={styles.listArea}>
          {rows.map((row, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{row}</Text>
            </View>
          ))}
        </View>
      </UPPullRefresh>
      <Text style={styles.blockTitle}>自定义下拉动画</Text>
      <UPPullRefresh
        height={320}
        onRefresh={onRefresh}
        pull={({ distance }) => (
          <View style={styles.customPull}>
            <Text style={styles.refreshEmoji}>👇</Text>
            <Text style={styles.refreshText}>下拉刷新 ({Math.round(Number(distance))}px)</Text>
          </View>
        )}
        refreshing={refreshing}
        refreshingNode={<View style={styles.customPull}><Text style={styles.refreshEmoji}>🔄</Text><Text style={styles.refreshText}>正在刷新...</Text></View>}
        release={() => (
          <View style={styles.customPull}>
            <Text style={styles.refreshEmoji}>👆</Text>
            <Text style={styles.refreshText}>释放刷新</Text>
          </View>
        )}
        threshold={60}
      >
        <View style={styles.listArea}>
          {rows.map((row, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{row}</Text>
            </View>
          ))}
        </View>
      </UPPullRefresh>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* componentsD/select — select variants                                */
/* ------------------------------------------------------------------ */

const SCENES = [
  { id: '1', name: '分类1' },
  { id: '2', name: '分类2' },
  { id: '3', name: '分类4' },
];

export function SelectPage(_props: DemoPageProps) {
  const [cateId, setCateId] = useState<string | number>('');
  const [pcSelectId, setPcSelectId] = useState<string | number>('');
  return (
    <View>
      <Text style={styles.blockTitle}>默认</Text>
      <UPSelect
        current={cateId}
        label="分类"
        onUpdateCurrent={(value) => setCateId(value ?? '')}
        options={SCENES}
        showOptionsLabel
      />
      <Text style={styles.blockTitle}>插槽</Text>
      <UPSelect
        current={cateId}
        label="分类"
        onUpdateCurrent={(value) => setCateId(value ?? '')}
        options={SCENES}
        renderOption={(item) => <Text style={{ padding: 4 }}>{String(item.name)}</Text>}
        showOptionsLabel
      />
      <Text style={styles.blockTitle}>边框与下拉宽度</Text>
      <UPSelect
        border
        current={pcSelectId}
        label="请选择分类"
        onUpdateCurrent={(value) => setPcSelectId(value ?? '')}
        options={SCENES}
        optionsWidth="100%"
        showOptionsLabel
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blockTitle: {
    color: '#303133',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 18,
  },
  cardBodyRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cardBodyText: {
    color: '#303133',
    fontSize: 13,
    lineHeight: 20,
  },
  cateBanner: {
    backgroundColor: '#fce38a',
    borderRadius: 8,
    height: 68,
    marginBottom: 10,
  },
  catePrice: {
    color: '#fa3534',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  cateRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 10,
  },
  cateTitle: {
    color: '#303133',
    fontSize: 14,
  },
  configTitle: {
    color: '#909399',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 14,
  },
  customPull: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
  },
  dragHandler: {
    backgroundColor: '#c0c4cc',
    borderRadius: 2,
    height: 22,
    width: 4,
  },
  dragItem: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: 'rgba(125, 126, 128, 0.35)',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 10,
  },
  dragItemH: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: 'rgba(125, 126, 128, 0.35)',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  jumpText: {
    color: '#303133',
    fontSize: 16,
    paddingVertical: 24,
    textAlign: 'center',
  },
  listArea: {
    backgroundColor: '#ffffff',
    padding: 12,
  },
  listItem: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  listItemText: {
    color: '#303133',
    fontSize: 14,
  },
  popoverContent: {
    color: '#303133',
    padding: 6,
  },
  refreshEmoji: {
    fontSize: 28,
  },
  refreshText: {
    color: '#909399',
    fontSize: 13,
    marginTop: 6,
  },
  rowEnd: {
    alignItems: 'flex-end',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  slotIcon: {
    backgroundColor: '#f9ae3d',
    borderRadius: 100,
    color: '#ffffff',
    fontSize: 12,
    height: 21,
    lineHeight: 21,
    textAlign: 'center',
    width: 21,
  },
});
