/**
 * UPAlert 组件示例 — 警告提示
 * 展示：不同主题、可关闭、显示图标、暗色模式、自定义内容
 */
import React, { useState } from 'react';
import { Text } from 'react-native';
import { UPAlert } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'type', type: 'success | warning | info | error', default: 'info', desc: '主题类型' },
 { prop: 'title', type: 'string', default: '—', desc: '标题' },
 { prop: 'description', type: 'string', default: '—', desc: '描述文字' },
 { prop: 'closable', type: 'boolean', default: 'true', desc: '是否可关闭' },
 { prop: 'showIcon', type: 'boolean', default: 'false', desc: '显示图标' },
 { prop: 'effect', type: 'light | dark', default: 'light', desc: '显示效果' },
 { prop: 'center', type: 'boolean', default: 'false', desc: '内容居中' },
 { prop: 'value', type: 'boolean', default: 'true', desc: '是否显示（v-model）' },
];

export default function AlertDemo() {
 const [show1, setShow1] = useState(true);
 const [show2, setShow2] = useState(true);

 return (
 <DemoPage>
 <Section title="四种主题">
 <UPAlert type="success" title="成功" description="这是一条成功的提示消息" showIcon />
 <UPAlert type="warning" title="警告" description="这是一条警告的提示消息" showIcon />
 <UPAlert type="info" title="信息" description="这是一条信息的提示消息" showIcon />
 <UPAlert type="error" title="错误" description="这是一条错误的提示消息" showIcon />
 </Section>

 <Section title="可关闭">
 {show1 ? (
 <UPAlert type="info" title="可关闭" closable onClose={() => setShow1(false)} />
 ) : (
 <Text style={{ color: '#909399', textAlign: 'center', padding: 12 }}>已关闭（点击下方重置）</Text>
 )}
 <Text
 style={{ color: '#3c9cff', textAlign: 'center', marginTop: 8 }}
 onPress={() => setShow1(true)}
 >
 重置显示
 </Text>
 </Section>

 <Section title="暗色模式">
 <UPAlert type="warning" title="暗色效果" effect="dark" showIcon />
 </Section>

 <Section title="居中 + 无图标">
 <UPAlert type="success" title="居中提示" center />
 </Section>

 <Section title="仅描述（无标题）">
 <UPAlert type="info" description="这是一段纯描述的提示信息" />
 </Section>

 <Section title="可关闭（受控）">
 {show2 ? (
 <UPAlert type="error" title="受控关闭" value={show2} onClose={() => setShow2(false)} closable />
 ) : null}
 <Text
 style={{ color: '#3c9cff', textAlign: 'center', marginTop: 8 }}
 onPress={() => setShow2(true)}
 >
 重新显示
 </Text>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
