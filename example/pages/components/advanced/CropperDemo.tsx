/**
 * Cropper 图片裁剪
 * 严格复刻 uview-plus pages/componentsD/cropper/cropper.nvue
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { UPAvatar, UPCropper, UPImage, type UPCropperConfirmPayload } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'imageSrc', type: 'string', default: "''", desc: '待裁剪的图片地址' },
  { prop: 'minScale', type: 'number', default: '0.3', desc: '裁剪框最小缩放比' },
  { prop: 'maxScale', type: 'number', default: '4', desc: '裁剪框最大缩放比' },
  { prop: 'canScale', type: 'boolean', default: 'true', desc: '是否显示缩放手柄与缩放按钮' },
  { prop: 'canRotate', type: 'boolean', default: 'true', desc: '是否可旋转（RN 侧尚未实现）' },
  { prop: 'lockWidth', type: 'string', default: "''", desc: '锁定宽度（RN 侧尚未实现）' },
  { prop: 'lockHeight', type: 'string', default: "''", desc: '锁定高度（RN 侧尚未实现）' },
  { prop: 'stretch', type: 'string', default: "''", desc: '拉伸模式（RN 侧尚未实现）' },
  { prop: 'lock', type: 'string', default: "''", desc: '锁定方向（RN 侧尚未实现）' },
  { prop: 'noTab', type: 'boolean', default: 'true', desc: '是否隐藏缩放按钮条' },
  { prop: 'inner', type: 'boolean', default: 'false', desc: '裁剪框限制在图片内（RN 侧尚未实现）' },
  { prop: 'quality', type: 'number | string', default: '0.9', desc: '导出质量（RN 侧尚未实现）' },
  { prop: 'index', type: 'string | number', default: "''", desc: '标识符，onConfirm 时回传' },
  { prop: 'canChangeSize', type: 'boolean', default: 'false', desc: '裁剪框可否改变大小（RN 侧尚未实现）' },
  { prop: 'areaWidth', type: 'string', default: "'300rpx'", desc: '裁剪框宽度' },
  { prop: 'areaHeight', type: 'string', default: "'300rpx'", desc: '裁剪框高度（RN 侧裁剪框恒为正方形）' },
  { prop: 'exportWidth', type: 'string', default: "'260rpx'", desc: '导出宽度，回传为 data.destWidth' },
  { prop: 'exportHeight', type: 'string', default: "'260rpx'", desc: '导出高度，回传为 data.destHeight' },
  { prop: 'fillColor', type: 'string', default: "'transparent'", desc: '导出留白填充色（RN 侧尚未实现）' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '根节点样式' },
  { prop: 'onAvtinit', type: '() => void', default: '—', desc: '组件初始化完成时触发' },
  { prop: 'onConfirm', type: '(payload) => void', default: '—', desc: '确定时触发，path 需原生适配器' },
  { prop: 'onCancel', type: '() => void', default: '—', desc: '取消时触发' },
];

// 源库第 4 段先用 uni.chooseImage 取临时路径再交给 cropper；RN 没有 uni API，
// 本地 UPCropper 也不带选图能力，四段统一用同一张远程示例图当 imageSrc。
const IMAGE_SRC = 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png';

export default function CropperDemo() {
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cutImage = (rsp: UPCropperConfirmPayload) => {
    console.log(rsp);
    // 源库 `urls[rsp.index] = rsp.path`。缺失：本地 UPCropper 没有原生裁剪适配器，
    // path 恒为 null，因此这里回落成空串，预览位仍显示默认头像。
    setUrls((prev) => ({ ...prev, [Number(rsp.index)]: rsp.path ?? '' }));
    setOpenIndex(null);
  };

  const cancel = () => setOpenIndex(null);

  return (
    <DemoPage>
      <PageItem title="头像裁剪">
        <View style={s.cutBox}>
          {/* 缺失：UPCropper 没有默认插槽，源库把头像塞进 up-cropper 内当触发器，这里外置 Pressable */}
          <Pressable onPress={() => setOpenIndex(0)} style={s.avatarWrapper}>
            <UPAvatar size="120px" src={urls[0]} />
          </Pressable>
          {openIndex === 0 ? (
            <UPCropper
              areaHeight="300rpx"
              areaWidth="300rpx"
              canChangeSize={false}
              exportHeight="260rpx"
              exportWidth="260rpx"
              imageSrc={IMAGE_SRC}
              index={0}
              onCancel={cancel}
              onConfirm={cutImage}
            />
          ) : null}
        </View>
      </PageItem>

      <PageItem title="可变大小">
        <View style={s.cutBox}>
          {/* 缺失：UPCropper 无 ref，源库 chooseImage(1, {...}) 的参数这里改成声明式 props */}
          <Pressable onPress={() => setOpenIndex(1)} style={s.avatarWrapper}>
            <UPImage height="160px" src={urls[1]} />
          </Pressable>
          {openIndex === 1 ? (
            <UPCropper
              areaHeight="180rpx"
              areaWidth="300rpx"
              canChangeSize
              exportHeight="160rpx"
              exportWidth="260rpx"
              imageSrc={IMAGE_SRC}
              index={1}
              onCancel={cancel}
              onConfirm={cutImage}
            />
          ) : null}
        </View>
      </PageItem>

      <PageItem title="限制在图片内">
        <View style={s.cutBox}>
          <Pressable onPress={() => setOpenIndex(2)} style={s.avatarWrapper}>
            <UPAvatar size="120px" src={urls[2]} />
          </Pressable>
          {openIndex === 2 ? (
            <UPCropper
              areaHeight="300rpx"
              areaWidth="300rpx"
              canChangeSize={false}
              exportHeight="260rpx"
              exportWidth="260rpx"
              imageSrc={IMAGE_SRC}
              index={2}
              inner
              onCancel={cancel}
              onConfirm={cutImage}
            />
          ) : null}
        </View>
      </PageItem>

      <PageItem title="裁剪已有临时图片">
        <View style={s.cutBox}>
          <Pressable onPress={() => setOpenIndex(3)} style={s.avatarWrapper}>
            <UPAvatar size="120px" src={urls[3]} />
          </Pressable>
          {openIndex === 3 ? (
            <UPCropper
              areaHeight="300rpx"
              areaWidth="300rpx"
              exportHeight="260rpx"
              exportWidth="260rpx"
              imageSrc={IMAGE_SRC}
              index={3}
              onCancel={cancel}
              onConfirm={cutImage}
            />
          ) : null}
        </View>
      </PageItem>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  avatarWrapper: { alignSelf: 'flex-start' },
  cutBox: { alignItems: 'flex-start' },
});
