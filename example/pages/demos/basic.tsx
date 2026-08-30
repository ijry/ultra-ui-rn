/**
 * 组件示例页 - 基础组件
 * 按钮、图标、文本、标签、徽标、链接、图片、头像
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  UPButton,
  UPIcon,
  UPText,
  UPTag,
  UPBadge,
  UPLink,
  UPImage,
  UPAvatar,
  UPAvatarGroup,
} from 'ultra-ui-rn';

export default function BasicPage() {
  const [clicks, setClicks] = useState(0);
  const [rateValue, setRateValue] = useState(3);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>基础组件</Text>

      {/* 按钮 Button */}
      <Text style={styles.section}>按钮 Button</Text>
      <View style={styles.row}>
        <UPButton text="Info" onClick={() => setClicks((v) => v + 1)} />
        <UPButton text="Primary" type="primary" />
        <UPButton plain text="Plain" type="success" />
      </View>
      <View style={styles.row}>
        <UPButton disabled text="Disabled" />
        <UPButton loading loadingText="Loading" text="Loading" type="warning" />
      </View>
      <Text>点击次数: {clicks}</Text>

      {/* 图标 Icon */}
      <Text style={styles.section}>图标 Icon</Text>
      <View style={styles.row}>
        <UPIcon color="primary" label="搜索" name="search" />
        <UPIcon color="success" label="完成" name="checkmark-circle-fill" />
        <UPIcon color="error" label="错误" name="error-circle-fill" />
      </View>

      {/* 文本 Text */}
      <Text style={styles.section}>文本 Text</Text>
      <UPText mode="price" prefixIcon="rmb" text="199" type="error" />
      <UPText format="encrypt" mode="phone" text="13812345678" />
      <UPText text="普通文本" />

      {/* 标签 Tag */}
      <Text style={styles.section}>标签 Tag</Text>
      <View style={styles.row}>
        <UPTag closable plain plainFill text="New" type="primary" />
        <UPTag icon="checkmark" text="Ready" type="success" />
        <UPTag text="Warning" type="warning" />
      </View>

      {/* 徽标 Badge */}
      <Text style={styles.section}>徽标 Badge</Text>
      <View style={styles.row}>
        <UPBadge value={12}>
          <UPIcon name="bell" size={28} />
        </UPBadge>
        <UPBadge value="New">
          <UPIcon name="email" size={28} />
        </UPBadge>
      </View>

      {/* 链接 Link */}
      <Text style={styles.section}>链接 Link</Text>
      <UPLink href="https://uviewui.com" text="uView 文档" underLine />

      {/* 图片 Image */}
      <Text style={styles.section}>图片 Image</Text>
      <UPImage
        height="64px"
        src="https://picsum.photos/128"
        width="64px"
      />

      {/* 头像 Avatar */}
      <Text style={styles.section}>头像 Avatar</Text>
      <View style={styles.row}>
        <UPAvatar text="UP" />
        <UPAvatar icon="person" shape="square" />
        <UPAvatarGroup
          maxCount={2}
          urls={[
            'https://picsum.photos/80?1',
            'https://picsum.photos/80?2',
            'https://picsum.photos/80?3',
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  section: {
    color: '#606266',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    color: '#303133',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
