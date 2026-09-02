/**
 * Card 卡片
 * 严格复刻 uview-plus pages/componentsB/card/card.vue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UPCard, UPIcon, UPTitle } from 'ultra-ui-rn';
import { DemoPage, ParamPanel, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'title', type: 'string', default: '—', desc: '头部左边的标题' },
  { prop: 'subTitle', type: 'string', default: '—', desc: '头部左边的副标题' },
  { prop: 'thumb', type: 'string', default: '—', desc: '左上角的图片' },
  { prop: 'padding', type: 'number | string', default: '15', desc: '各部分内边距' },
  { prop: 'border', type: 'boolean', default: 'true', desc: '是否显示外边框' },
  { prop: 'showHead', type: 'boolean', default: 'true', desc: '是否显示头部' },
  { prop: 'showFoot', type: 'boolean', default: 'true', desc: '是否显示底部' },
  { prop: 'head', type: 'ReactNode', default: '—', desc: '自定义头部（源 head 插槽）' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '卡片主体（源 body 插槽）' },
  { prop: 'foot', type: 'ReactNode', default: '—', desc: '自定义底部（源 foot 插槽）' },
  { prop: 'onClick', type: '(index) => void', default: '—', desc: '点击整个卡片时触发' },
  { prop: 'onHeadClick', type: '(index) => void', default: '—', desc: '点击头部时触发' },
];

const THUMB = 'https://uview-plus.jiangruyi.com/uview/ext/59c256f85a8c3757.jpg';
const BODY_IMAGE = 'https://uview-plus.jiangruyi.com/uview/ext/59c256f85a8c3757.jpg';

export default function CardDemo() {
  const [thumb, setThumb] = useState(THUMB);
  const [padding, setPadding] = useState(15);
  const [bottomSlot, setBottomSlot] = useState(true);
  const [border, setBorder] = useState(true);

  return (
    <DemoPage>
      <View style={s.cardWrap}>
        <UPTitle customStyle={s.title}>基础卡片</UPTitle>
        <UPCard showHead={false}>
          <Text style={s.bodyText}>
            尊敬的客户您好，您有来自的开票。如果有疑问请联系您的客户经理。
          </Text>
        </UPCard>

        <UPTitle customStyle={s.title}>高级卡片</UPTitle>
        <UPCard
          border={border}
          foot={
            bottomSlot ? (
              <View>
                <UPIcon label="30评论" name="chat-fill" size={16} />
              </View>
            ) : undefined
          }
          padding={padding}
          showFoot={bottomSlot}
          subTitle="2023-05-15"
          thumb={thumb}
          title="素胚勾勒出青花，笔锋浓转淡"
        >
          <View>
            <View style={s.bodyItemTop}>
              <Text numberOfLines={2} style={s.bodyItemTitle}>
                瓶身描绘的牡丹一如你初妆，冉冉檀香透过窗心事我了然，宣纸上走笔至此搁一半
              </Text>
              <Image source={{ uri: BODY_IMAGE }} style={s.image} />
            </View>
            <View style={s.bodyItem}>
              <Text numberOfLines={2} style={s.bodyItemTitle}>
                釉色渲染仕女图韵味被私藏，而你嫣然的一笑如含苞待放
              </Text>
              <Image source={{ uri: BODY_IMAGE }} style={s.image} />
            </View>
          </View>
        </UPCard>
      </View>

      <View style={s.demo}>
        <Text style={s.blockTitle}>参数配置</Text>

        <ParamPanel
          current={thumb === THUMB ? 0 : 1}
          label="左上角图标"
          onChange={(index) => setThumb(index === 0 ? THUMB : '')}
          options={['显示', '隐藏']}
        />

        <ParamPanel
          current={[10, 15, 20].indexOf(padding)}
          label="内边距"
          onChange={(index) => setPadding([10, 15, 20][index] ?? 15)}
          options={['10', '15', '20']}
        />

        <ParamPanel
          current={bottomSlot ? 0 : 1}
          label="底部"
          onChange={(index) => setBottomSlot(index === 0)}
          options={['显示', '隐藏']}
        />

        <ParamPanel
          current={border ? 0 : 1}
          label="外边框"
          onChange={(index) => setBorder(index === 0)}
          options={['显示', '隐藏']}
        />
      </View>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  blockTitle: { color: '#909193', fontSize: 14, marginBottom: 8 },
  bodyItem: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  bodyItemTitle: { flex: 1, fontSize: 14, lineHeight: 22, marginRight: 8 },
  bodyItemTop: {
    alignItems: 'flex-start',
    borderBottomColor: '#e4e7ed',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  bodyText: { fontSize: 14, fontWeight: '500', lineHeight: 25 },
  cardWrap: { marginBottom: 20 },
  demo: { marginBottom: 23 },
  image: { borderRadius: 4, height: 50, width: 50 },
  title: { paddingLeft: 15, paddingTop: 10 },
});
