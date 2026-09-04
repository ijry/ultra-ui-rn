/**
 * Agreement 弹窗协议
 * 严格复刻 uview-plus pages/componentsD/agreement/agreement.nvue
 */
import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UPAgreement, UPButton, type UPAgreementRef } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  {
    prop: 'urlProtocol',
    type: 'string',
    default: "'/pages/user_agreement/agreement/info?title=用户协议'",
    desc: '用户协议地址，随 onProtocolPress 回传',
  },
  {
    prop: 'urlPrivacy',
    type: 'string',
    default: "'/pages/user_agreement/agreement/info?title=隐私政策'",
    desc: '隐私政策地址，随 onPrivacyPress 回传',
  },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '自定义协议正文（源默认插槽）' },
  { prop: 'contentStyle', type: 'StyleProp<TextStyle>', default: '—', desc: '默认正文文本样式' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '默认正文容器样式' },
  { prop: 'onConfirm', type: '(value: 1) => void', default: '—', desc: '点击「阅读并同意」时触发' },
  { prop: 'onClose', type: '() => void', default: '—', desc: '取消或遮罩关闭时触发' },
  { prop: 'onProtocolPress', type: '(url: string) => void', default: '—', desc: '点击「用户协议」时触发' },
  { prop: 'onPrivacyPress', type: '(url: string) => void', default: '—', desc: '点击「隐私政策」时触发' },
];

// 源库脚本里自定义插槽用的三个 navigator 地址（与组件 props 上的两个地址不同）
const URL_PROTOCOL = '/pages/agreement/protocol';
const URL_PRIVACY = '/pages/agreement/privacy';
const URL_THIRD = '/pages/agreement/third-party';

export default function AgreementDemo() {
  const agreement1 = useRef<UPAgreementRef>(null);
  const agreement2 = useRef<UPAgreementRef>(null);

  // 源库把返回值写进未被渲染的 checked1/checked2，这里只保留 console.log
  const change1 = (val: 1) => {
    console.log('agreement1 change:', val);
  };

  const change2 = (val: 1) => {
    console.log('agreement2 change:', val);
  };

  const showAgreement1 = () => {
    agreement1.current?.showModal();
  };

  const showAgreement2 = () => {
    agreement2.current?.showModal();
  };

  return (
    <DemoPage>
      <PageItem title="基础用法">
        <UPButton onClick={showAgreement1} type="primary">
          显示协议
        </UPButton>
        <UPAgreement
          onConfirm={change1}
          ref={agreement1}
          urlPrivacy="/pages/user_agreement/agreement/info?title=隐私政策"
          urlProtocol="/pages/user_agreement/agreement/info?title=用户协议"
        />
      </PageItem>

      <PageItem title="自定义插槽">
        <UPButton onClick={showAgreement2} type="error">
          显示协议
        </UPButton>
        <UPAgreement
          onConfirm={change2}
          ref={agreement2}
          urlPrivacy="/pages/user_agreement/agreement/info?title=隐私政策"
          urlProtocol="/pages/user_agreement/agreement/info?title=用户协议"
        >
          <View style={s.customContent}>
            <Text style={s.title}>请仔细阅读并同意以下协议：</Text>
            {/* 源库用 <navigator :url>；RN 没有 uni-app 页面路由，改为 Pressable 打印目标地址 */}
            <View style={s.agreementItem}>
              <Text style={s.itemText}>《</Text>
              <Pressable accessibilityRole="link" onPress={() => console.log('navigate:', URL_PROTOCOL)}>
                <Text style={s.inlineLink}>用户服务协议</Text>
              </Pressable>
              <Text style={s.itemText}>》</Text>
            </View>
            <View style={s.agreementItem}>
              <Text style={s.itemText}>《</Text>
              <Pressable accessibilityRole="link" onPress={() => console.log('navigate:', URL_PRIVACY)}>
                <Text style={s.inlineLink}>隐私保护政策</Text>
              </Pressable>
              <Text style={s.itemText}>》</Text>
            </View>
            <View style={s.agreementItem}>
              <Text style={s.itemText}>《</Text>
              <Pressable accessibilityRole="link" onPress={() => console.log('navigate:', URL_THIRD)}>
                <Text style={s.inlineLink}>第三方信息共享清单</Text>
              </Pressable>
              <Text style={s.itemText}>》</Text>
            </View>
          </View>
        </UPAgreement>
      </PageItem>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  // 源库 `.agreement-item { display: inline-block }`，RN 无 inline-block，用横向 flex 近似
  agreementItem: { alignItems: 'center', flexDirection: 'row' },
  customContent: { paddingVertical: 4 },
  inlineLink: { color: '#2979ff', fontSize: 15 },
  itemText: { color: '#303133', fontSize: 15 },
  title: { color: '#303133', fontSize: 15, marginBottom: 6 },
});
