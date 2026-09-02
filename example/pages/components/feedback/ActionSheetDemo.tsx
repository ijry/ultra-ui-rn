/**
 * ActionSheet 操作菜单
 * 严格复刻 uview-plus pages/componentsB/actionSheet/actionSheet.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  UPActionSheet,
  UPCell,
  UPCellGroup,
  toast,
  type UPActionSheetAction,
} from 'ultra-ui-rn';
import { EventLog } from '../_shared';

const actions0: UPActionSheetAction[] = [
  { name: '选项1' },
  ...Array.from({ length: 11 }, () => ({ name: '选项2' })),
  { name: '选项3', subname: '描述文本' },
];

const actions1: UPActionSheetAction[] = [
  { name: '选项1' },
  { loading: true },
  { name: '选项被禁用', disabled: true },
];

const actions2: UPActionSheetAction[] = [{ name: '选项1' }, { name: '选项2' }, { name: '选项3' }];
const actions3: UPActionSheetAction[] = [{ name: '选项1' }, { name: '选项2' }, { name: '选项3' }];
const actions5: UPActionSheetAction[] = [
  { name: '获取用户信息', openType: 'getUserInfo', color: '#5ac725' },
];

const list = [
  { title: '普通使用', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/actionSheet/custom.png' },
  { title: '设置状态', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/actionSheet/status.png' },
  { title: '显示取消按钮', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/actionSheet/cancel.png' },
  { title: '描述内容', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/actionSheet/desc.png' },
  { title: '显示标题(显示圆角)', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/actionSheet/title.png' },
  { title: '微信开放能力', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/actionSheet/open.png' },
];

export default function ActionSheetDemo() {
  const [active, setActive] = useState(-1);
  const [events, setEvents] = useState<string[]>([]);

  const openSheet = (index: number) => {
    // 源在非微信端直接提示，第 6 项依赖 openType 开放能力。
    if (index === 5) {
      toast.default('请在微信内预览');
      return;
    }
    setActive(index);
  };

  const close = () => {
    setEvents((prev) => [...prev, 'close']);
    setActive(-1);
  };

  const select = (action: UPActionSheetAction) => {
    setEvents((prev) => [...prev, `select ${String(action.name ?? '')}`]);
  };

  return (
    <View style={s.page}>
      <UPCellGroup>
        {list.map((item, index) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => openSheet(index)}
            title={item.title}
          />
        ))}
      </UPCellGroup>

      <UPActionSheet
        actions={actions0}
        closeOnClickOverlay={false}
        onClose={close}
        onSelect={select}
        show={active === 0}
      />
      <UPActionSheet actions={actions1} onClose={() => setActive(-1)} show={active === 1} />
      <UPActionSheet
        actions={actions2}
        cancelText="取消"
        onClose={() => setActive(-1)}
        show={active === 2}
      />
      <UPActionSheet
        actions={actions3}
        description="这是一段描述文本,字号偏小,颜色偏淡"
        onClose={() => setActive(-1)}
        show={active === 3}
      />
      <UPActionSheet onClose={() => setActive(-1)} round={10} show={active === 4} title="标题位置">
        <Text style={s.slotText}>
          这是一段通过slot传入的内容,您可以在此自定义操作面板
        </Text>
      </UPActionSheet>
      <UPActionSheet
        actions={actions5}
        onClose={() => setActive(-1)}
        show={active === 5}
        title="微信开放能力"
      />

      <EventLog events={events} />
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  page: { flex: 1, padding: 0 },
  slotText: {
    color: '#303133',
    fontSize: 15,
    marginBottom: 30,
    marginHorizontal: 20,
    marginTop: 10,
  },
});
