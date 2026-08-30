/**
 * UPUpload 组件示例 — 上传
 * 展示：基础上传、多选、限制数量/大小、自定义样式、文件列表
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPUpload, type UPUploadFile } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'fileList', type: 'UPUploadFile[]', default: '[]', desc: '文件列表（受控）' },
  { prop: 'maxCount', type: 'number', default: 'Infinity', desc: '最大上传数量' },
  { prop: 'maxSize', type: 'number', default: 'Infinity', desc: '最大文件大小 (bytes)' },
  { prop: 'multiple', type: 'boolean', default: 'false', desc: '是否多选' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'deletable', type: 'boolean', default: 'true', desc: '是否显示删除按钮' },
  { prop: 'uploadText', type: 'string', default: '上传', desc: '上传区域文字' },
  { prop: 'capture', type: 'boolean | string', default: '—', desc: '图片选取方式' },
  { prop: 'accept', type: 'UPUploadAccept', default: '—', desc: '接受的文件类型' },
  { prop: 'compressed', type: 'boolean', default: 'true', desc: '是否压缩图片' },
];

export default function UploadDemo({ onBack }: DemoProps) {
  const [files1, setFiles1] = useState<UPUploadFile[]>([]);
  const [files2, setFiles2] = useState<UPUploadFile[]>([]);
  const [files3, setFiles3] = useState<UPUploadFile[]>([
    { url: 'https://picsum.photos/200/200?random=1' },
  ]);
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="Upload 上传" onBack={onBack}>
      <Section title="基础用法">
        <UPUpload
          fileList={files1}
          onAfterRead={(files) => {
            setFiles1((prev) => [...prev, ...Array.from(files)]);
            setEvents((e) => [...e, `afterRead: ${files.length} files`]);
          }}
          onDelete={(payload) => {
            setFiles1(payload.fileList as UPUploadFile[]);
          }}
        />
        <Value label="文件数" value={files1.length} />
      </Section>

      <Section title="多选 + 限制数量">
        <UPUpload
          fileList={files2}
          multiple
          maxCount={3}
          onAfterRead={(files) => {
            setFiles2((prev) => {
              const next = [...prev, ...Array.from(files)];
              return next.slice(0, 3);
            });
            setEvents((e) => [...e, `afterRead: ${files.length} files (max 3)`]);
          }}
          onDelete={(payload) => {
            setFiles2(payload.fileList as UPUploadFile[]);
          }}
        />
        <Value label="文件数" value={`${files2.length} / 3`} />
      </Section>

      <Section title="已有文件列表">
        <UPUpload
          fileList={files3}
          deletable={false}
          onAfterRead={(files) => {
            setFiles3((prev) => [...prev, ...Array.from(files)]);
          }}
        />
        <Value label="文件数" value={files3.length} />
      </Section>

      <Section title="禁用状态">
        <UPUpload disabled fileList={[{ url: 'https://picsum.photos/200/200?random=2' }]} />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
