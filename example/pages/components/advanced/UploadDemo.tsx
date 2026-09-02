/**
 * Upload 上传
 * 严格复刻 uview-plus pages/componentsB/upload/upload.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { UPUpload, type UPUploadFile } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'fileList', type: 'UPUploadFile[]', default: '[]', desc: '已上传的文件列表' },
  { prop: 'name', type: 'string', default: '—', desc: '标识符，事件回调时回传' },
  { prop: 'multiple', type: 'boolean', default: 'false', desc: '是否开启图片多选' },
  { prop: 'maxCount', type: 'number', default: '52', desc: '最大选择图片的数量' },
  { prop: 'accept', type: "'image' | 'video' | 'media' | 'file' | 'all'", default: "'image'", desc: '接受的文件类型' },
  { prop: 'previewFullImage', type: 'boolean', default: 'true', desc: '是否点击预览已上传的图片' },
  { prop: 'useBeforeRead', type: 'boolean', default: 'false', desc: '是否启用读取前钩子' },
  { prop: 'width', type: 'number | string', default: '80', desc: '预览图和上传区域宽度' },
  { prop: 'height', type: 'number | string', default: '80', desc: '预览图和上传区域高度' },
  { prop: 'renderUpload', type: '(payload) => ReactNode', default: '—', desc: '自定义上传区域（源默认插槽）' },
  { prop: 'onAfterRead', type: '(files) => void', default: '—', desc: '读取文件后触发' },
  { prop: 'onDelete', type: '(payload) => void', default: '—', desc: '删除文件时触发' },
];

const SWIPER_1 = 'https://uview-plus.jiangruyi.com/uview/swiper/1.jpg';
const POSITIVE = 'https://uview-plus.jiangruyi.com/uview/demo/upload/positive.png';

/** Upstream wraps each uploader in `.u-page__upload-item` (`margin-top: 5px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function UploadDemo() {
  const [fileList1, setFileList1] = useState<UPUploadFile[]>([]);
  const [fileList2, setFileList2] = useState<UPUploadFile[]>([]);
  const [fileList3, setFileList3] = useState<UPUploadFile[]>([{ url: SWIPER_1 }]);
  const [fileList4, setFileList4] = useState<UPUploadFile[]>([
    { url: SWIPER_1 },
    { url: SWIPER_1 },
  ]);
  const [fileList5, setFileList5] = useState<UPUploadFile[]>([]);
  const [fileList6, setFileList6] = useState<UPUploadFile[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  // 源在 afterRead 里先塞 uploading 占位再逐个 uni.uploadFile；
  // RN 侧没有真实接口，用定时器模拟同样的两阶段状态迁移。
  const afterRead = (
    setter: React.Dispatch<React.SetStateAction<UPUploadFile[]>>,
    files: readonly UPUploadFile[],
  ) => {
    const pending = files.map((file) => ({ ...file, status: 'uploading' as const, message: '上传中' }));
    setter((prev) => [...prev, ...pending]);
    setTimeout(() => {
      setter((prev) =>
        prev.map((file) =>
          file.status === 'uploading' ? { ...file, status: 'success' as const, message: '' } : file,
        ),
      );
    }, 1000);
  };

  const beforeRead = () => setEvents((prev) => [...prev, 'beforeRead']);

  return (
    <DemoPage>
      <Section title="基础用法">
        <Item>
          <UPUpload
            fileList={fileList1}
            maxCount={10}
            multiple
            name="1"
            onAfterRead={(files) => afterRead(setFileList1, files)}
            onBeforeRead={beforeRead}
            onDelete={(payload) => setFileList1([...(payload.fileList ?? [])])}
            useBeforeRead
          />
        </Item>
      </Section>

      <Section title="上传视频">
        <Item>
          <UPUpload
            accept="video"
            fileList={fileList2}
            maxCount={10}
            multiple
            name="2"
            onAfterRead={(files) => afterRead(setFileList2, files)}
            onDelete={(payload) => setFileList2([...(payload.fileList ?? [])])}
          />
        </Item>
      </Section>

      <Section title="文件预览">
        <Item>
          <UPUpload
            fileList={fileList3}
            maxCount={10}
            multiple
            name="3"
            onAfterRead={(files) => afterRead(setFileList3, files)}
            onDelete={(payload) => setFileList3([...(payload.fileList ?? [])])}
            previewFullImage
          />
        </Item>
      </Section>

      <Section title="隐藏上传按钮">
        <Item>
          <UPUpload
            fileList={fileList4}
            maxCount={2}
            multiple
            name="4"
            onAfterRead={(files) => afterRead(setFileList4, files)}
            onDelete={(payload) => setFileList4([...(payload.fileList ?? [])])}
          />
        </Item>
      </Section>

      <Section title="限制上传数量">
        <Item>
          <UPUpload
            fileList={fileList5}
            maxCount={3}
            multiple
            name="5"
            onAfterRead={(files) => afterRead(setFileList5, files)}
            onDelete={(payload) => setFileList5([...(payload.fileList ?? [])])}
          />
        </Item>
      </Section>

      <Section title="自定义上传样式">
        <Item>
          <UPUpload
            fileList={fileList6}
            height="150"
            maxCount={1}
            multiple
            name="6"
            onAfterRead={(files) => afterRead(setFileList6, files)}
            onDelete={(payload) => setFileList6([...(payload.fileList ?? [])])}
            renderUpload={() => <Image source={{ uri: POSITIVE }} style={s.positive} />}
            width="250"
          />
        </Item>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { marginTop: 5 },
  positive: { height: 150, width: 250 },
});
