/**
 * 组件示例页索引
 * 支持两级导航：分类 → 组件
 */
import type { ComponentType } from 'react';
import { CATEGORIES, COMPONENTS, getComponentsByCategory, type ComponentCategory } from '../registry';

// 页面属性类型
export interface DemoPageProps {
  onBack?: () => void;
}

// 动态加载分类页面
export const loadCategoryPage = async (category: ComponentCategory) => {
  switch (category) {
    case 'basic':
      return (await import('./basic')).default;
    case 'form':
      return (await import('./form')).default;
    case 'navigation':
      return (await import('./navigation')).default;
    case 'display':
      return (await import('./display')).default;
    case 'feedback':
      return (await import('./feedback')).default;
    case 'advanced':
      return (await import('./advanced')).default;
    case 'layout':
      return (await import('./layout')).default;
    default:
      throw new Error(`Unknown category: ${category}`);
  }
};

// 动态加载组件演示页面
export const loadComponentDemo = async (componentId: string) => {
  const component = COMPONENTS.find(c => c.id === componentId);
  if (!component) throw new Error(`Unknown component: ${componentId}`);
  
  const module = await import(`../components/${component.category}/${componentId}Demo`);
  return module.default;
};

// 导出统计信息
export const DEMO_STATS = {
  categories: CATEGORIES.length,
  components: COMPONENTS.length,
  byCategory: CATEGORIES.map(cat => ({
    ...cat,
    count: getComponentsByCategory(cat.id).length,
  })),
};
