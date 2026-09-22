/**
 * Cropper 图片裁剪
 * 严格复刻 uview-plus pages/componentsD/cropper/cropper.nvue
 */
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { UPAvatar, UPCropper, UPImage, type UPCropperConfirmPayload, type UPCropperHandle } from 'ultra-ui-rn';
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
  { prop: 'imagePickerAdapter', type: '(options?) => Promise<string | null>', default: '—', desc: 'RN 原生选图接缝：注入相册/相机，返回图片 URI 或 null（取消）' },
  { prop: 'onAvtinit', type: '() => void', default: '—', desc: '组件初始化完成时触发' },
  { prop: 'onConfirm', type: '(payload) => void', default: '—', desc: '确定时触发，path 需原生适配器' },
  { prop: 'onCancel', type: '() => void', default: '—', desc: '取消时触发' },
];
// ref 方法 chooseImage(index, options)：优先用 options.imageSrc，否则走
// imagePickerAdapter 选图，再带每次调用的裁剪参数打开裁剪。

const IMAGE_SRC = 'https://uview-plus.jiangruyi.com/uview/swiper/swiper1.png';

// 源库靠 uni.chooseImage 从相册选图；RN 没有该 API，demo 用一个 mock 适配器返回
// 固定示例图来演示选图路径（真机应接 react-native-image-picker 等）。
const mockPicker = async (): Promise<string | null> => IMAGE_SRC;

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

  // section 2 走 ref 驱动：头像作外置触发器，点击调 chooseImage（对齐源库 chooseImage1）。
  const cropperRef1 = useRef<UPCropperHandle>(null);

  return (
    <DemoPage>
      <PageItem title="头像裁剪">
        <View style={s.cutBox}>
          {/* 源库把头像作 up-cropper 默认插槽当触发器；本地插槽的自动触发语义无法从
              demo-only 源码验证，故这一段仍用外置 Pressable + 声明式 imageSrc。 */}
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
          {/* 对齐源库 chooseImage1(1, {...})：ref.chooseImage 经 imagePickerAdapter 选图，
              再带每次调用的裁剪参数打开。cropper 常驻，未选图时显示占位提示。 */}
          <Pressable
            onPress={() => cropperRef1.current?.chooseImage(1, {
              canChangeSize: true,
              areaWidth: '300rpx',
              areaHeight: '180rpx',
              exportWidth: '260rpx',
              exportHeight: '160rpx',
            })}
            style={s.avatarWrapper}
          >
            <UPImage height="160px" src={urls[1]} />
          </Pressable>
          <UPCropper
            imagePickerAdapter={mockPicker}
            index={1}
            onCancel={cancel}
            onConfirm={cutImage}
            ref={cropperRef1}
          />
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
