/**
 * Signature 签名
 * 严格复刻 uview-plus pages/componentsD/signature/signature.nvue
 */
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { toast, UPAlert, UPButton, UPSignature, useUPTheme, type UPSignatureRef } from 'ultra-ui-rn';
import { DemoPage, PageItem } from '../_shared';

export default function SignatureDemo() {
  const signature1 = useRef<UPSignatureRef>(null);
  const signature2 = useRef<UPSignatureRef>(null);
  const [signatureImage1, setSignatureImage1] = useState('');
  const [signatureImage2, setSignatureImage2] = useState('');
  // 源库用 `:bg-color="upThemeIsDark ? '#1c1c1e' : '#f5f5f5'"`
  const { mode } = useUPTheme();
  const bgColor = mode === 'dark' ? '#1c1c1e' : '#f5f5f5';

  const onConfirm1 = (result: { tempFilePath: string }) => {
    setSignatureImage1(result.tempFilePath);
    console.log('签名图片路径1:', result.tempFilePath);
  };

  const onError1 = (err: Error) => {
    console.error('签名导出错误1:', err);
    toast.default('签名导出失败');
  };

  const clearSignature1 = () => {
    setSignatureImage1('');
    signature1.current?.clear();
  };

  const onConfirm2 = (result: { tempFilePath: string }) => {
    setSignatureImage2(result.tempFilePath);
    console.log('签名图片路径2:', result.tempFilePath);
  };

  const onError2 = (err: Error) => {
    console.error('签名导出错误2:', err);
    toast.default('签名导出失败');
  };

  const clearSignature2 = () => {
    setSignatureImage2('');
    signature2.current?.clear();
  };

  return (
    <DemoPage>
      <UPAlert customStyle={s.alert} description="PC端查看时需要触摸仿真模式" />

      <PageItem title="基础签名示例">
        <UPSignature
          bgColor={bgColor}
          height={200}
          onConfirm={onConfirm1}
          onError={onError1}
          ref={signature1}
          showToolbar={false}
          width={700}
        />
        {signatureImage1 ? (
          <View style={s.preview}>
            <Text>签名预览:</Text>
            <Image source={{ uri: signatureImage1 }} style={s.previewImage} />
            <UPButton onClick={clearSignature1} size="small" text="清除签名" type="primary" />
          </View>
        ) : null}
      </PageItem>

      <PageItem title="自定义颜色和工具栏示例">
        <UPSignature
          bgColor={bgColor}
          color="#ff0000"
          height={200}
          onConfirm={onConfirm2}
          onError={onError2}
          ref={signature2}
          thickness={6}
          width={700}
        />
        {signatureImage2 ? (
          <View style={s.preview}>
            <Text>签名预览:</Text>
            <Image source={{ uri: signatureImage2 }} style={s.previewImage} />
            <UPButton onClick={clearSignature2} size="small" text="清除签名" type="primary" />
          </View>
        ) : null}
      </PageItem>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  alert: {
    marginBottom: 10,
  },
  preview: {
    alignItems: 'center',
    marginTop: 10,
  },
  previewImage: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    height: 200,
    marginBottom: 10,
    marginTop: 10,
    width: 700,
  },
});
