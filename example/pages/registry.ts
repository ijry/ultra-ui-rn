/**
 * 组件示例页注册表
 * 按 uview-plus 风格，两级导航：分类 → 组件
 */

// Component categories
export type ComponentCategory =
  | 'basic'
  | 'form'
  | 'navigation'
  | 'display'
  | 'feedback'
  | 'advanced'
  | 'layout';

// Category metadata
export interface CategoryMeta {
  id: ComponentCategory;
  title: string;
  icon: string;
  description: string;
}

// Component metadata
export interface ComponentMeta {
  id: string;
  title: string;
  category: ComponentCategory;
  /** Source component name in ultra-ui-rn */
  sourceComponent: string;
  /** Description */
  description: string;
}

// All categories
export const CATEGORIES: readonly CategoryMeta[] = [
  {
    id: 'basic',
    title: '基础组件',
    icon: 'cube',
    description: '按钮、图标、文本、标签、徽标、链接、图片、头像',
  },
  {
    id: 'form',
    title: '表单组件',
    icon: 'edit',
    description: '输入框、搜索、开关、复选框、单选框、选择器、滑块、评分',
  },
  {
    id: 'navigation',
    title: '导航组件',
    icon: 'compass',
    description: '导航栏、标签栏、标签页、下拉菜单、步骤条、分段控制器',
  },
  {
    id: 'display',
    title: '展示组件',
    icon: 'eye',
    description: '卡片、单元格、折叠、进度、计数器、骨架屏、空状态、分割线',
  },
  {
    id: 'feedback',
    title: '反馈组件',
    icon: 'chatbubble',
    description: 'Toast、通知、弹窗、模态框、操作面板、加载、引导',
  },
  {
    id: 'advanced',
    title: '高级组件',
    icon: 'star',
    description: '上传、相册、轮播、表格、索引列表、瀑布流、树、拖拽排序、签名',
  },
  {
    id: 'layout',
    title: '布局组件',
    icon: 'grid',
    description: '行、列、网格、滚动容器、吸顶、安全区域、返回顶部',
  },
];

// All components (95 total)
export const COMPONENTS: readonly ComponentMeta[] = [
  // Basic (9)
  { id: 'Button', title: 'Button 按钮', category: 'basic', sourceComponent: 'UPButton', description: '按钮组件' },
  { id: 'Icon', title: 'Icon 图标', category: 'basic', sourceComponent: 'UPIcon', description: '图标组件' },
  { id: 'Text', title: 'Text 文本', category: 'basic', sourceComponent: 'UPText', description: '文本组件' },
  { id: 'Tag', title: 'Tag 标签', category: 'basic', sourceComponent: 'UPTag', description: '标签组件' },
  { id: 'Badge', title: 'Badge 徽标', category: 'basic', sourceComponent: 'UPBadge', description: '徽标组件' },
  { id: 'Link', title: 'Link 链接', category: 'basic', sourceComponent: 'UPLink', description: '链接组件' },
  { id: 'Image', title: 'Image 图片', category: 'basic', sourceComponent: 'UPImage', description: '图片组件' },
  { id: 'Avatar', title: 'Avatar 头像', category: 'basic', sourceComponent: 'UPAvatar', description: '头像组件' },
  { id: 'AvatarGroup', title: 'AvatarGroup 头像组', category: 'basic', sourceComponent: 'UPAvatarGroup', description: '头像组组件' },

  // Form (19)
  { id: 'Input', title: 'Input 输入框', category: 'form', sourceComponent: 'UPInput', description: '输入框组件' },
  { id: 'Textarea', title: 'Textarea 多行输入', category: 'form', sourceComponent: 'UPTextarea', description: '多行输入框组件' },
  { id: 'Search', title: 'Search 搜索框', category: 'form', sourceComponent: 'UPSearch', description: '搜索框组件' },
  { id: 'Switch', title: 'Switch 开关', category: 'form', sourceComponent: 'UPSwitch', description: '开关组件' },
  { id: 'Checkbox', title: 'Checkbox 复选框', category: 'form', sourceComponent: 'UPCheckbox', description: '复选框组件' },
  { id: 'Radio', title: 'Radio 单选框', category: 'form', sourceComponent: 'UPRadio', description: '单选框组件' },
  { id: 'Slider', title: 'Slider 滑块', category: 'form', sourceComponent: 'UPSlider', description: '滑块组件' },
  { id: 'Rate', title: 'Rate 评分', category: 'form', sourceComponent: 'UPRate', description: '评分组件' },
  { id: 'NumberBox', title: 'NumberBox 数字输入', category: 'form', sourceComponent: 'UPNumberBox', description: '数字输入组件' },
  { id: 'Picker', title: 'Picker 选择器', category: 'form', sourceComponent: 'UPPicker', description: '选择器组件' },
  { id: 'DatetimePicker', title: 'DatetimePicker 日期时间选择', category: 'form', sourceComponent: 'UPDatetimePicker', description: '日期时间选择组件' },
  { id: 'Cascader', title: 'Cascader 级联选择', category: 'form', sourceComponent: 'UPCascader', description: '级联选择组件' },
  { id: 'Form', title: 'Form 表单', category: 'form', sourceComponent: 'UPForm', description: '表单组件' },
  { id: 'FormItem', title: 'FormItem 表单项', category: 'form', sourceComponent: 'UPFormItem', description: '表单项组件' },
  { id: 'CodeInput', title: 'CodeInput 验证码输入', category: 'form', sourceComponent: 'UPCodeInput', description: '验证码输入组件' },
  { id: 'NumberKeyboard', title: 'NumberKeyboard 数字键盘', category: 'form', sourceComponent: 'UPNumberKeyboard', description: '数字键盘组件' },
  { id: 'CarKeyboard', title: 'CarKeyboard 车牌键盘', category: 'form', sourceComponent: 'UPCarKeyboard', description: '车牌键盘组件' },
  { id: 'Code', title: 'Code 验证码', category: 'form', sourceComponent: 'UPCode', description: '验证码组件' },
  { id: 'Choose', title: 'Choose 选择器', category: 'form', sourceComponent: 'UPChoose', description: '选择器组件' },

  // Navigation (9)
  { id: 'Navbar', title: 'Navbar 导航栏', category: 'navigation', sourceComponent: 'UPNavbar', description: '导航栏组件' },
  { id: 'NavbarMini', title: 'NavbarMini 迷你导航栏', category: 'navigation', sourceComponent: 'UPNavbarMini', description: '迷你导航栏组件' },
  { id: 'Tabbar', title: 'Tabbar 标签栏', category: 'navigation', sourceComponent: 'UPTabbar', description: '标签栏组件' },
  { id: 'Tabs', title: 'Tabs 标签页', category: 'navigation', sourceComponent: 'UPTabs', description: '标签页组件' },
  { id: 'Steps', title: 'Steps 步骤条', category: 'navigation', sourceComponent: 'UPSteps', description: '步骤条组件' },
  { id: 'Dropdown', title: 'Dropdown 下拉菜单', category: 'navigation', sourceComponent: 'UPDropdown', description: '下拉菜单组件' },
  { id: 'Subsection', title: 'Subsection 分段控制器', category: 'navigation', sourceComponent: 'UPSubsection', description: '分段控制器组件' },
  { id: 'Pagination', title: 'Pagination 分页', category: 'navigation', sourceComponent: 'UPPagination', description: '分页组件' },
  { id: 'Toolbar', title: 'Toolbar 工具栏', category: 'navigation', sourceComponent: 'UPToolbar', description: '工具栏组件' },

  // Display (14)
  { id: 'Card', title: 'Card 卡片', category: 'display', sourceComponent: 'UPCard', description: '卡片组件' },
  { id: 'Cell', title: 'Cell 单元格', category: 'display', sourceComponent: 'UPCell', description: '单元格组件' },
  { id: 'CellGroup', title: 'CellGroup 单元格组', category: 'display', sourceComponent: 'UPCellGroup', description: '单元格组组件' },
  { id: 'Collapse', title: 'Collapse 折叠面板', category: 'display', sourceComponent: 'UPCollapse', description: '折叠面板组件' },
  { id: 'LineProgress', title: 'LineProgress 线性进度条', category: 'display', sourceComponent: 'UPLineProgress', description: '线性进度条组件' },
  { id: 'CircleProgress', title: 'CircleProgress 环形进度条', category: 'display', sourceComponent: 'UPCircleProgress', description: '环形进度条组件' },
  { id: 'CountDown', title: 'CountDown 倒计时', category: 'display', sourceComponent: 'UPCountDown', description: '倒计时组件' },
  { id: 'CountTo', title: 'CountTo 数字滚动', category: 'display', sourceComponent: 'UPCountTo', description: '数字滚动组件' },
  { id: 'Skeleton', title: 'Skeleton 骨架屏', category: 'display', sourceComponent: 'UPSkeleton', description: '骨架屏组件' },
  { id: 'Empty', title: 'Empty 空状态', category: 'display', sourceComponent: 'UPEmpty', description: '空状态组件' },
  { id: 'Divider', title: 'Divider 分割线', category: 'display', sourceComponent: 'UPDivider', description: '分割线组件' },
  { id: 'Section', title: 'Section 内容区', category: 'display', sourceComponent: 'UPSection', description: '内容区组件' },
  { id: 'Title', title: 'Title 标题', category: 'display', sourceComponent: 'UPTitle', description: '标题组件' },
  { id: 'Alert', title: 'Alert 警告提示', category: 'display', sourceComponent: 'UPAlert', description: '警告提示组件' },

  // Feedback (10)
  { id: 'Toast', title: 'Toast 轻提示', category: 'feedback', sourceComponent: 'UPToast', description: '轻提示组件' },
  { id: 'Notify', title: 'Notify 通知', category: 'feedback', sourceComponent: 'UPNotify', description: '通知组件' },
  { id: 'Popup', title: 'Popup 弹出层', category: 'feedback', sourceComponent: 'UPPopup', description: '弹出层组件' },
  { id: 'Modal', title: 'Modal 模态框', category: 'feedback', sourceComponent: 'UPModal', description: '模态框组件' },
  { id: 'ActionSheet', title: 'ActionSheet 操作面板', category: 'feedback', sourceComponent: 'UPActionSheet', description: '操作面板组件' },
  { id: 'LoadingPage', title: 'LoadingPage 加载页', category: 'feedback', sourceComponent: 'UPLoadingPage', description: '加载页组件' },
  { id: 'Guide', title: 'Guide 引导', category: 'feedback', sourceComponent: 'UPGuide', description: '引导组件' },
  { id: 'Tooltip', title: 'Tooltip 文字提示', category: 'feedback', sourceComponent: 'UPTooltip', description: '文字提示组件' },
  { id: 'Popover', title: 'Popover 气泡弹出', category: 'feedback', sourceComponent: 'UPPopover', description: '气泡弹出组件' },
  { id: 'SwipeAction', title: 'SwipeAction 滑动操作', category: 'feedback', sourceComponent: 'UPSwipeAction', description: '滑动操作组件' },

  // Advanced (21)
  { id: 'Upload', title: 'Upload 上传', category: 'advanced', sourceComponent: 'UPUpload', description: '上传组件' },
  { id: 'Album', title: 'Album 相册', category: 'advanced', sourceComponent: 'UPAlbum', description: '相册组件' },
  { id: 'Swiper', title: 'Swiper 轮播', category: 'advanced', sourceComponent: 'UPSwiper', description: '轮播组件' },
  { id: 'Table', title: 'Table 表格', category: 'advanced', sourceComponent: 'UPTable', description: '表格组件' },
  { id: 'IndexList', title: 'IndexList 索引列表', category: 'advanced', sourceComponent: 'UPIndexList', description: '索引列表组件' },
  { id: 'Waterfall', title: 'Waterfall 瀑布流', category: 'advanced', sourceComponent: 'UPWaterfall', description: '瀑布流组件' },
  { id: 'Tree', title: 'Tree 树形控件', category: 'advanced', sourceComponent: 'UPTree', description: '树形控件组件' },
  { id: 'Dragsort', title: 'Dragsort 拖拽排序', category: 'advanced', sourceComponent: 'UPDragsort', description: '拖拽排序组件' },
  { id: 'Signature', title: 'Signature 签名', category: 'advanced', sourceComponent: 'UPSignature', description: '签名组件' },
  { id: 'VirtualList', title: 'VirtualList 虚拟列表', category: 'advanced', sourceComponent: 'UPVirtualList', description: '虚拟列表组件' },
  { id: 'PullRefresh', title: 'PullRefresh 下拉刷新', category: 'advanced', sourceComponent: 'UPPullRefresh', description: '下拉刷新组件' },
  { id: 'LazyLoad', title: 'LazyLoad 懒加载', category: 'advanced', sourceComponent: 'UPLazyLoad', description: '懒加载组件' },
  { id: 'Canvas', title: 'Canvas 画布', category: 'advanced', sourceComponent: 'UPCanvas', description: '画布组件' },
  { id: 'Qrcode', title: 'Qrcode 二维码', category: 'advanced', sourceComponent: 'UPQrcode', description: '二维码组件' },
  { id: 'Barcode', title: 'Barcode 条形码', category: 'advanced', sourceComponent: 'UPBarcode', description: '条形码组件' },
  { id: 'Coupon', title: 'Coupon 优惠券', category: 'advanced', sourceComponent: 'UPCoupon', description: '优惠券组件' },
  { id: 'ColorPicker', title: 'ColorPicker 颜色选择', category: 'advanced', sourceComponent: 'UPColorPicker', description: '颜色选择组件' },
  { id: 'GoodsSku', title: 'GoodsSku 商品SKU', category: 'advanced', sourceComponent: 'UPGoodsSku', description: '商品SKU组件' },
  { id: 'Markdown', title: 'Markdown', category: 'advanced', sourceComponent: 'UPMarkdown', description: 'Markdown组件' },
  { id: 'Parse', title: 'Parse 富文本解析', category: 'advanced', sourceComponent: 'UPParse', description: '富文本解析组件' },
  { id: 'NovelReader', title: 'NovelReader 小说阅读', category: 'advanced', sourceComponent: 'UPNovelReader', description: '小说阅读组件' },

  // Layout (13)
  { id: 'Row', title: 'Row 行布局', category: 'layout', sourceComponent: 'UPRow', description: '行布局组件' },
  { id: 'Col', title: 'Col 列布局', category: 'layout', sourceComponent: 'UPCol', description: '列布局组件' },
  { id: 'Grid', title: 'Grid 网格', category: 'layout', sourceComponent: 'UPGrid', description: '网格组件' },
  { id: 'GridItem', title: 'GridItem 网格项', category: 'layout', sourceComponent: 'UPGridItem', description: '网格项组件' },
  { id: 'View', title: 'View 视图容器', category: 'layout', sourceComponent: 'UPView', description: '视图容器组件' },
  { id: 'Box', title: 'Box 盒容器', category: 'layout', sourceComponent: 'UPBox', description: '盒容器组件' },
  { id: 'Gap', title: 'Gap 间距', category: 'layout', sourceComponent: 'UPGap', description: '间距组件' },
  { id: 'Line', title: 'Line 线条', category: 'layout', sourceComponent: 'UPLine', description: '线条组件' },
  { id: 'ScrollHost', title: 'ScrollHost 滚动容器', category: 'layout', sourceComponent: 'UPScrollHost', description: '滚动容器组件' },
  { id: 'Sticky', title: 'Sticky 吸顶', category: 'layout', sourceComponent: 'UPSticky', description: '吸顶组件' },
  { id: 'SafeBottom', title: 'SafeBottom 安全区域', category: 'layout', sourceComponent: 'UPSafeBottom', description: '安全区域组件' },
  { id: 'BackTop', title: 'BackTop 返回顶部', category: 'layout', sourceComponent: 'UPBackTop', description: '返回顶部组件' },
  { id: 'List', title: 'List 列表', category: 'layout', sourceComponent: 'UPList', description: '列表组件' },
];

// Helper: get components by category
export function getComponentsByCategory(category: ComponentCategory): ComponentMeta[] {
  return COMPONENTS.filter(c => c.category === category);
}

// Helper: get component by id
export function getComponentById(id: string): ComponentMeta | undefined {
  return COMPONENTS.find(c => c.id === id);
}

// Helper: get category by id
export function getCategoryById(id: ComponentCategory): CategoryMeta | undefined {
  return CATEGORIES.find(c => c.id === id);
}

// Statistics
export const STATS = {
  totalComponents: COMPONENTS.length,
  totalCategories: CATEGORIES.length,
  byCategory: CATEGORIES.map(cat => ({
    ...cat,
    count: getComponentsByCategory(cat.id).length,
  })),
};
