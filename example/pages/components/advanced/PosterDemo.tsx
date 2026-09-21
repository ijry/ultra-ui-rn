/**
 * Poster 海报生成
 * 严格复刻 uview-plus pages/componentsD/poster/poster.nvue
 */
import React, { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import {
  toast,
  UPButton,
  UPPoster,
  type UPPosterExportResult,
  type UPPosterHandle,
  type UPPosterJson,
} from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'json', type: 'UPPosterJson', default: '{}', desc: '海报描述（css + views）' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '海报根节点样式' },
  {
    prop: 'exportImageAdapter',
    type: '(json, layout) => Promise<UPPosterExportResult>',
    default: '—',
    desc: 'RN 原生接缝：注入 react-native-view-shot 才能拿到真实 path',
  },
  { prop: 'onExport', type: '(result) => void', default: '—', desc: '海报导出完成时触发（源 @export）' },
];

// 海报配置数据（与源库逐字一致）
const POSTER_CONFIG: UPPosterJson = {
  css: {
    width: '750rpx',
    height: '1114rpx',
    // 缺失：UPPoster 只读 css.backgroundColor，源库的 background 渐变不会渲染
    background: 'linear-gradient(135deg,#fce38a,#f38181)',
  },
  views: [
    // 背景卡片
    {
      type: 'view',
      css: {
        position: 'absolute',
        left: '40rpx',
        top: '144rpx',
        // 缺失：UPPoster 读 backgroundColor，源库的 background / shadow 不生效；radius 现已支持
        background: '#fff',
        radius: '16rpx',
        width: '670rpx',
        height: '930rpx',
        shadow: '0 20rpx 48rpx rgba(0,0,0,.05)',
      },
    },
    // 标题文本
    {
      type: 'text',
      text: '为您挑选了一个好物',
      css: {
        position: 'absolute',
        color: '#666',
        left: '144rpx',
        top: '90rpx',
        fontSize: '30rpx',
      },
    },
    // 商品图片
    {
      type: 'image',
      // H5下图片域名要注意允许跨域
      src: 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png',
      css: {
        position: 'absolute',
        left: '72rpx',
        top: '176rpx',
        width: '606rpx',
        height: '606rpx',
        radius: '12rpx',
      },
    },
    // 价格
    {
      type: 'text',
      text: '￥299',
      css: {
        position: 'absolute',
        color: '#FF0000',
        left: '66rpx',
        top: '840rpx',
        fontSize: '56rpx',
        fontWeight: 'bold',
      },
    },
    // 商品标题
    {
      type: 'text',
      text: '精美陶瓷茶具套装，高端大气上档次，送礼自用两相宜',
      css: {
        position: 'absolute',
        // 缺失：UPPoster 的 text 分支没有 numberOfLines，lineClamp 不生效
        lineClamp: 2,
        width: '396rpx',
        color: '#333',
        left: '72rpx',
        top: '930rpx',
        fontSize: '36rpx',
        lineHeight: '50rpx',
      },
    },
    // 二维码
    {
      type: 'qrcode',
      // 缺失：UPPoster 的 qrcode 分支只画灰底占位方块，不生成真实二维码
      text: 'https://example.com/product/123',
      css: {
        position: 'absolute',
        left: '500rpx',
        top: '864rpx',
        width: '178rpx',
        height: '178rpx',
      },
    },
  ],
};

export default function PosterDemo() {
  const poster = useRef<UPPosterHandle>(null);
  // 生成的海报图片URL
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [posterPreviewWidth, setPosterPreviewWidth] = useState(0);
  const [posterPreviewHeight, setPosterPreviewHeight] = useState(0);

  const getPosterPreviewWidth = () => {
    // 源库 uni.getSystemInfoSync().windowWidth
    const windowWidth = Number(Dimensions.get('window').width) || 375;
    return Math.max(1, windowWidth - 30);
  };

  const updatePosterPreviewSize = (width: number, height: number) => {
    const sourceWidth = Number(width) || 1;
    const sourceHeight = Number(height) || 1;
    const previewWidth = getPosterPreviewWidth();
    setPosterPreviewWidth(previewWidth);
    setPosterPreviewHeight(Math.max(1, Math.round((previewWidth * sourceHeight) / sourceWidth)));
  };

  // 海报导出回调
  const onPosterExport = (result: UPPosterExportResult) => {
    console.log('海报导出结果:', result);
  };

  // 生成海报
  const generatePoster = async () => {
    const handle = poster.current;
    if (!handle) return;
    try {
      // 源库用 uni.showLoading / uni.hideLoading / uni.showToast
      toast.loading('海报生成中...');
      const result = await handle.exportImage();
      updatePosterPreviewSize(result.width, result.height);
      // 缺失：未注入 exportImageAdapter 时 exportImage() 的 path 恒为 null，预览区不会出现
      setPosterImageUrl(result.path ?? '');
      toast.hide();
      toast.success('海报生成成功');
    } catch (error) {
      toast.hide();
      toast.default('海报生成失败');
      console.error('海报生成失败:', error);
    }
  };

  const previewSize = { height: posterPreviewHeight, width: posterPreviewWidth };

  return (
    <DemoPage>
      <PageItem title="基础示例">
        {/* 生成海报按钮 */}
        <UPButton onClick={generatePoster} shape="circle" type="primary">
          生成海报
        </UPButton>

        {/* 海报预览区域；源库背景取 upThemeVar('--up-card-bg-color')，RN 侧无该 token，固定用白色 */}
        {posterImageUrl ? (
          <View style={[s.posterPreview, previewSize]}>
            <Image resizeMode="contain" source={{ uri: posterImageUrl }} style={previewSize} />
          </View>
        ) : null}

        {/* 海报组件：源库是离屏 canvas（不可见），本地 UPPoster 用真实 RN 视图渲染，故可见。
            750rpx 正好等于屏宽，用 -30 负边距抵掉 DemoPage + PageItem 的 15+15 内边距。 */}
        <View style={s.posterStage}>
          <UPPoster json={POSTER_CONFIG} onExport={onPosterExport} ref={poster} />
        </View>
      </PageItem>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  posterPreview: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  posterStage: { marginHorizontal: -30, overflow: 'hidden' },
});
