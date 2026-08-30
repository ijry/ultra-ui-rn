/**
 * 组件示例页 - 展示组件
 * 卡片、单元格、折叠、步骤条、进度、计数器、骨架屏、空状态、分割线
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  UPCard,
  UPCell,
  UPCellGroup,
  UPCollapse,
  UPCollapseItem,
  UPSteps,
  UPStepsItem,
  UPLineProgress,
  UPCircleProgress,
  UPCountDown,
  UPCountTo,
  UPSkeleton,
  UPEmpty,
  UPDivider,
  UPSection,
  UPView,
  UPBox,
  UPGap,
  UPLine,
  UPTitle,
  UPAlert,
  UPBadge,
  UPButton,
  UPText,
} from 'ultra-ui-rn';

export default function DisplayPage() {
  const [progress, setProgress] = useState(35);
  const [openCollapseNames, setOpenCollapseNames] = useState<(string | number)[]>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>展示组件</Text>

      {/* 卡片 Card */}
      <Text style={styles.section}>卡片 Card</Text>
      <UPCard foot={<UPText text="卡片底部" />} title="源兼容卡片">
        <UPText text="卡片内容支持任意 React Native 内容。" />
      </UPCard>

      {/* 单元格 Cell */}
      <Text style={styles.section}>单元格 Cell</Text>
      <UPCellGroup title="个人信息">
        <UPCell isLink label="账户偏好" title="设置" value="已配置" />
        <UPCell icon="email" title="消息" value="2" />
      </UPCellGroup>

      {/* 折叠 Collapse */}
      <Text style={styles.section}>折叠 Collapse</Text>
      <UPCollapse
        onChange={(items) =>
          setOpenCollapseNames(
            items.filter((item) => item.status === 'open').map((item) => item.name),
          )
        }
        value={openCollapseNames}
      >
        <UPCollapseItem name="details" title="可展开详情">
          <UPText text="折叠项保留源 open/close 状态。" />
        </UPCollapseItem>
        <UPCollapseItem label="当前配送状态" name="shipping" title="物流">
          <UPText text="已打包，等待承运商取件。" />
        </UPCollapseItem>
      </UPCollapse>

      {/* 步骤条 Steps */}
      <Text style={styles.section}>步骤条 Steps</Text>
      <UPSteps current={1}>
        <UPStepsItem desc="10:00" title="已打包" />
        <UPStepsItem desc="10:30" title="已发货" />
        <UPStepsItem title="已送达" />
      </UPSteps>

      {/* 进度条 LineProgress */}
      <Text style={styles.section}>进度条 LineProgress</Text>
      <UPLineProgress percentage={progress} />

      {/* 圆形进度 CircleProgress */}
      <Text style={styles.section}>圆形进度 CircleProgress</Text>
      <View style={styles.row}>
        <UPCircleProgress percentage={progress} />
        <UPButton text="增加进度" onClick={() => setProgress((v) => Math.min(100, v + 15))} />
      </View>
      <Text>进度: {progress}%</Text>

      {/* 倒计时 CountDown */}
      <Text style={styles.section}>倒计时 CountDown</Text>
      <UPCountDown format="mm:ss" time={75_000} />

      {/* 数字递增 CountTo */}
      <Text style={styles.section}>数字递增 CountTo</Text>
      <UPCountTo decimals={1} duration={800} endVal={1234.5} separator="," />

      {/* 骨架屏 Skeleton */}
      <Text style={styles.section}>骨架屏 Skeleton</Text>
      <UPSkeleton avatar rows={2} />

      {/* 空状态 Empty */}
      <Text style={styles.section}>空状态 Empty</Text>
      <UPEmpty text="暂无数据" />

      {/* 分割线 Divider */}
      <Text style={styles.section}>分割线 Divider</Text>
      <UPDivider text="没有更多了" />

      {/* 区域标题 Section */}
      <Text style={styles.section}>区域标题 Section</Text>
      <UPSection title="热门内容" />

      {/* 标题 Title */}
      <Text style={styles.section}>标题 Title</Text>
      <UPTitle>
        <Text style={styles.titleText}>推荐标题</Text>
      </UPTitle>

      {/* 视图容器 View */}
      <Text style={styles.section}>视图容器 View</Text>
      <UPView backgroundColor="#ffffff" padding="12px">
        <UPText text="UPView 将源 style props 映射为原生 View 样式。" />
      </UPView>

      {/* 间距 Gap */}
      <Text style={styles.section}>间距 Gap</Text>
      <UPGap bgColor="#e8eaed" height="20px" />

      {/* 线条 Line */}
      <Text style={styles.section}>线条 Line</Text>
      <UPLine dashed />

      {/* 盒子 Box */}
      <Text style={styles.section}>盒子 Box</Text>
      <UPBox />

      {/* 警告 Alert */}
      <Text style={styles.section}>警告 Alert</Text>
      <UPAlert
        closable
        description="源兼容警告提示。"
        showIcon
        title="公告"
      />

      {/* 徽标 Badge */}
      <Text style={styles.section}>徽标 Badge</Text>
      <View style={styles.row}>
        <UPBadge value={12}>
          <UPText text="消息" />
        </UPBadge>
        <UPBadge value="New">
          <UPText text="通知" />
        </UPBadge>
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
  titleText: {
    color: '#303133',
    fontSize: 18,
    fontWeight: '700',
  },
});
