/**
 * NoNetwork 无网络提示
 * 严格复刻 uview-plus pages/componentsC/noNetwork/noNetwork.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPButton, UPIcon, UPNoNetwork } from 'ultra-ui-rn';
import { DemoPage, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'tips', type: 'string', default: "'哎呀，网络信号丢失'", desc: '无网络时的提示语' },
  { prop: 'zIndex', type: 'number | string', default: "'' (10080)", desc: '层级，为空时取 zIndex.noNetwork' },
  { prop: 'image', type: 'string', default: "''", desc: '无网络时的图片，非图片地址时作为图标名' },
  { prop: 'connected', type: 'boolean', default: '—', desc: 'RN 适配：由宿主传入当前联网状态' },
  { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '定义需要用到的外部样式' },
  { prop: 'imageStyle', type: 'ImageStyle', default: '—', desc: '图片的样式' },
  { prop: 'onRetry', type: '() => void', default: '—', desc: '点击"重试"按钮时触发' },
  { prop: 'onDisconnected', type: '() => void', default: '—', desc: '网络断开时触发' },
  { prop: 'onConnected', type: '() => void', default: '—', desc: '网络连接成功时触发' },
];

export default function NoNetworkDemo() {
  const [connected, setConnected] = useState(true);

  return (
    <DemoPage>
      {/* 上游 @disconnected/@connected 仅 console.log，此处等价。 */}
      <UPNoNetwork
        connected={connected}
        onConnected={() => console.log('connected')}
        onDisconnected={() => console.log('disconnected')}
        onRetry={() => setConnected(true)}
      />

      <View style={s.content}>
        <View style={s.contentCircle}>
          <UPIcon color="#fff" name="checkbox-mark" size={30} />
        </View>
        <Text style={s.contentNormal}>网络正常</Text>
        <Text style={s.contentTips}>请您断开设备的WiFi和数据连接(或开启飞行模式)，即可看到效果</Text>
        {/* 上游靠真机断网触发；本地 UPNoNetwork 无内置网络探测（上游用
            uni.getNetworkType + uni.onNetworkStatusChange），connected 只能由宿主给出，
            故补一个按钮模拟断网，遮罩上的"重试"会把 connected 置回 true。 */}
        <UPButton
          customStyle={s.simulate}
          onClick={() => setConnected(false)}
          size="small"
          text="模拟断网"
          type="primary"
        />
      </View>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 60,
    paddingTop: 150,
  },
  contentCircle: {
    alignItems: 'center',
    backgroundColor: '#5ac725',
    borderRadius: 100,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  contentNormal: { color: '#5ac725', fontSize: 15, marginTop: 15 },
  contentTips: { color: '#909399', fontSize: 13, marginTop: 15, textAlign: 'center' },
  simulate: { marginTop: 30, width: 120 },
});
