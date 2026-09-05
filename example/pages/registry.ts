/**
 * 组件示例页注册表
 *
 * 首页的分组与顺序严格照抄上游索引
 * `docs/uview-plus-demo-source/pages/example/components.config.js`：
 * 7 个分组、组内条目顺序、中文标签、icon 名全部逐条对齐（见 SOURCE_GROUPS）。
 *
 * `category` 不再决定首页怎么分组，它只用来定位 demo 文件所在目录
 * （`components/<category>/<id>Demo.tsx`，host.tsx 靠它查表）。把「展示分组」和
 * 「文件归属」拆开，是为了对齐上游索引而不必搬动 115 个文件 —— 上游的分组与本地
 * 目录本来就不是一对一（例如上游把 Overlay/NoNetwork 放在布局组件，本地在 feedback）。
 */

/** 上游索引里一条组件入口。`id` 为 null 表示上游有这一条、本地还没有 demo 页。 */
export interface SourceGroupItem {
  /** 上游 components.config.js 的 icon 名 */
  icon: string;
  id: string | null;
  /** 上游原文标签，例如 `Icon 图标` */
  title: string;
}

export interface SourceGroup {
  groupName: string;
  items: readonly SourceGroupItem[];
}

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
    icon: 'bag',
    description: '按钮、图标、文本、标签、徽标、链接、图片、头像',
  },
  {
    id: 'form',
    title: '表单组件',
    icon: 'edit-pen',
    description: '输入框、搜索、开关、复选框、单选框、选择器、滑块、评分',
  },
  {
    id: 'navigation',
    title: '导航组件',
    icon: 'list',
    description: '导航栏、标签栏、标签页、下拉菜单、步骤条、分段控制器',
  },
  {
    id: 'display',
    title: '展示组件',
    icon: 'photo',
    description: '卡片、单元格、折叠、进度、计数器、骨架屏、空状态、分割线',
  },
  {
    id: 'feedback',
    title: '反馈组件',
    icon: 'chat',
    description: 'Toast、通知、弹窗、模态框、操作面板、加载、引导',
  },
  {
    id: 'advanced',
    title: '高级组件',
    icon: 'star-fill',
    description: '上传、相册、轮播、表格、索引列表、瀑布流、树、拖拽排序、签名',
  },
  {
    id: 'layout',
    title: '布局组件',
    icon: 'grid-fill',
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
  { id: 'Badge', title: 'Badge 徽标数', category: 'basic', sourceComponent: 'UPBadge', description: '徽标组件' },
  { id: 'Link', title: 'Link 超链接', category: 'basic', sourceComponent: 'UPLink', description: '链接组件' },
  { id: 'Image', title: 'Image 图片', category: 'basic', sourceComponent: 'UPImage', description: '图片组件' },
  { id: 'Avatar', title: 'Avatar 头像', category: 'basic', sourceComponent: 'UPAvatar', description: '头像组件' },
  { id: 'AvatarGroup', title: 'AvatarGroup 头像组', category: 'basic', sourceComponent: 'UPAvatarGroup', description: '头像组组件' },

  // Form (19)
  { id: 'Input', title: 'Input 输入框', category: 'form', sourceComponent: 'UPInput', description: '输入框组件' },
  { id: 'Textarea', title: 'Textarea 文本域', category: 'form', sourceComponent: 'UPTextarea', description: '多行输入框组件' },
  { id: 'Search', title: 'Search 搜索', category: 'form', sourceComponent: 'UPSearch', description: '搜索框组件' },
  { id: 'Switch', title: 'Switch 开关选择器', category: 'form', sourceComponent: 'UPSwitch', description: '开关组件' },
  { id: 'Checkbox', title: 'Checkbox 复选框', category: 'form', sourceComponent: 'UPCheckbox', description: '复选框组件' },
  { id: 'Radio', title: 'Radio 单选框', category: 'form', sourceComponent: 'UPRadio', description: '单选框组件' },
  { id: 'Slider', title: 'Slider 滑动选择器', category: 'form', sourceComponent: 'UPSlider', description: '滑块组件' },
  { id: 'Rate', title: 'Rate 评分', category: 'form', sourceComponent: 'UPRate', description: '评分组件' },
  { id: 'NumberBox', title: 'NumberBox 步进器', category: 'form', sourceComponent: 'UPNumberBox', description: '数字输入组件' },
  { id: 'Picker', title: 'Picker 选择器', category: 'form', sourceComponent: 'UPPicker', description: '选择器组件' },
  { id: 'DatetimePicker', title: 'DatetimePicker 时间选择器', category: 'form', sourceComponent: 'UPDatetimePicker', description: '日期时间选择组件' },
  { id: 'Cascader', title: 'Cascader 级联选择器', category: 'form', sourceComponent: 'UPCascader', description: '级联选择组件' },
  { id: 'Form', title: 'Form 表单', category: 'form', sourceComponent: 'UPForm', description: '表单组件' },
  { id: 'FormItem', title: 'FormItem 表单项', category: 'form', sourceComponent: 'UPFormItem', description: '表单项组件' },
  { id: 'CodeInput', title: 'CodeInput 验证码输入', category: 'form', sourceComponent: 'UPCodeInput', description: '验证码输入组件' },
  { id: 'Keyboard', title: 'Keyboard 键盘', category: 'form', sourceComponent: 'UPKeyboard', description: '键盘组件' },
  { id: 'Code', title: 'Code 验证码倒计时', category: 'form', sourceComponent: 'UPCode', description: '验证码组件' },
  { id: 'Choose', title: 'Choose 选项选择器', category: 'form', sourceComponent: 'UPChoose', description: '选择器组件' },

  // Navigation (9)
  { id: 'Navbar', title: 'Navbar 导航栏', category: 'navigation', sourceComponent: 'UPNavbar', description: '导航栏组件' },
  { id: 'NavbarMini', title: 'NavbarMini 迷你导航栏', category: 'navigation', sourceComponent: 'UPNavbarMini', description: '迷你导航栏组件' },
  { id: 'Tabbar', title: 'Tabbar 底部导航栏', category: 'navigation', sourceComponent: 'UPTabbar', description: '标签栏组件' },
  { id: 'Tabs', title: 'Tabs 标签', category: 'navigation', sourceComponent: 'UPTabs', description: '标签页组件' },
  { id: 'Steps', title: 'Steps 步骤条', category: 'navigation', sourceComponent: 'UPSteps', description: '步骤条组件' },
  { id: 'Dropdown', title: 'Dropdown 下拉菜单', category: 'navigation', sourceComponent: 'UPDropdown', description: '下拉菜单组件' },
  { id: 'Subsection', title: 'Subsection 分段器', category: 'navigation', sourceComponent: 'UPSubsection', description: '分段控制器组件' },
  { id: 'Pagination', title: 'Pagination 分页器', category: 'navigation', sourceComponent: 'UPPagination', description: '分页组件' },
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
  { id: 'Empty', title: 'Empty 内容为空', category: 'display', sourceComponent: 'UPEmpty', description: '空状态组件' },
  { id: 'Divider', title: 'Divider 分割线', category: 'display', sourceComponent: 'UPDivider', description: '分割线组件' },
  { id: 'Section', title: 'Section 内容区', category: 'display', sourceComponent: 'UPSection', description: '内容区组件' },
  { id: 'Title', title: 'Title 标题', category: 'display', sourceComponent: 'UPTitle', description: '标题组件' },
  { id: 'Alert', title: 'Alert 警告提示', category: 'display', sourceComponent: 'UPAlert', description: '警告提示组件' },

  // Feedback (10)
  { id: 'Toast', title: 'Toast 消息提示', category: 'feedback', sourceComponent: 'UPToast', description: '轻提示组件' },
  { id: 'Notify', title: 'Notify 消息提示', category: 'feedback', sourceComponent: 'UPNotify', description: '通知组件' },
  { id: 'Popup', title: 'Popup 弹出层', category: 'feedback', sourceComponent: 'UPPopup', description: '弹出层组件' },
  { id: 'Modal', title: 'Modal 模态框', category: 'feedback', sourceComponent: 'UPModal', description: '模态框组件' },
  { id: 'ActionSheet', title: 'ActionSheet 上拉菜单', category: 'feedback', sourceComponent: 'UPActionSheet', description: '操作面板组件' },
  { id: 'LoadingPage', title: 'LoadingPage 加载页', category: 'feedback', sourceComponent: 'UPLoadingPage', description: '加载页组件' },
  { id: 'Guide', title: 'Guide 首屏引导', category: 'feedback', sourceComponent: 'UPGuide', description: '引导组件' },
  { id: 'Tooltip', title: 'Tooltip 长按提示', category: 'feedback', sourceComponent: 'UPTooltip', description: '文字提示组件' },
  { id: 'Popover', title: 'Popover 弹窗提示', category: 'feedback', sourceComponent: 'UPPopover', description: '气泡弹出组件' },
  { id: 'SwipeAction', title: 'SwipeAction 滑动单元格', category: 'feedback', sourceComponent: 'UPSwipeAction', description: '滑动操作组件' },

  // Advanced (21)
  { id: 'Upload', title: 'Upload 上传', category: 'advanced', sourceComponent: 'UPUpload', description: '上传组件' },
  { id: 'Album', title: 'Album 相册', category: 'advanced', sourceComponent: 'UPAlbum', description: '相册组件' },
  { id: 'Swiper', title: 'Swiper 轮播图', category: 'advanced', sourceComponent: 'UPSwiper', description: '轮播组件' },
  { id: 'Table', title: 'Table 表格', category: 'advanced', sourceComponent: 'UPTable', description: '表格组件' },
  { id: 'IndexList', title: 'IndexList 索引列表', category: 'advanced', sourceComponent: 'UPIndexList', description: '索引列表组件' },
  { id: 'Waterfall', title: 'Waterfall 瀑布流', category: 'advanced', sourceComponent: 'UPWaterfall', description: '瀑布流组件' },
  { id: 'Tree', title: 'Tree 树形', category: 'advanced', sourceComponent: 'UPTree', description: '树形控件组件' },
  { id: 'Dragsort', title: 'Dragsort 拖动排序', category: 'advanced', sourceComponent: 'UPDragsort', description: '拖拽排序组件' },
  { id: 'Signature', title: 'Signature 签名签字', category: 'advanced', sourceComponent: 'UPSignature', description: '签名组件' },
  { id: 'VirtualList', title: 'VirtualList 虚拟列表', category: 'advanced', sourceComponent: 'UPVirtualList', description: '虚拟列表组件' },
  { id: 'PullRefresh', title: 'PullRefresh 下拉刷新', category: 'advanced', sourceComponent: 'UPPullRefresh', description: '下拉刷新组件' },
  { id: 'LazyLoad', title: 'LazyLoad 懒加载', category: 'advanced', sourceComponent: 'UPLazyLoad', description: '懒加载组件' },
  { id: 'Canvas', title: 'Canvas 画布', category: 'advanced', sourceComponent: 'UPCanvas', description: '画布组件' },
  { id: 'Qrcode', title: 'Qrcode 二维码', category: 'advanced', sourceComponent: 'UPQrcode', description: '二维码组件' },
  { id: 'Barcode', title: 'Barcode 条码', category: 'advanced', sourceComponent: 'UPBarcode', description: '条形码组件' },
  { id: 'Coupon', title: 'Coupon 优惠券', category: 'advanced', sourceComponent: 'UPCoupon', description: '优惠券组件' },
  { id: 'ColorPicker', title: 'ColorPicker 颜色选择器', category: 'advanced', sourceComponent: 'UPColorPicker', description: '颜色选择组件' },
  { id: 'GoodsSku', title: 'GoodsSku 商品SKU', category: 'advanced', sourceComponent: 'UPGoodsSku', description: '商品SKU组件' },
  { id: 'Markdown', title: 'Markdown 解析器', category: 'advanced', sourceComponent: 'UPMarkdown', description: 'Markdown组件' },
  { id: 'Parse', title: 'Parse 富文本解析器', category: 'advanced', sourceComponent: 'UPParse', description: '富文本解析组件' },
  { id: 'NovelReader', title: 'NovelReader 小说阅读器', category: 'advanced', sourceComponent: 'UPNovelReader', description: '小说阅读组件' },

  // Layout (13)
  { id: 'Row', title: 'Row 行布局', category: 'layout', sourceComponent: 'UPRow', description: '行布局组件' },
  { id: 'Col', title: 'Col 列布局', category: 'layout', sourceComponent: 'UPCol', description: '列布局组件' },
  { id: 'Grid', title: 'Grid 宫格布局', category: 'layout', sourceComponent: 'UPGrid', description: '网格组件' },
  { id: 'GridItem', title: 'GridItem 网格项', category: 'layout', sourceComponent: 'UPGridItem', description: '网格项组件' },
  { id: 'View', title: 'View 视图容器', category: 'layout', sourceComponent: 'UPView', description: '视图容器组件' },
  { id: 'Box', title: 'Box 盒子', category: 'layout', sourceComponent: 'UPBox', description: '盒容器组件' },
  { id: 'Gap', title: 'Gap 间隔槽', category: 'layout', sourceComponent: 'UPGap', description: '间距组件' },
  { id: 'Line', title: 'Line 线条', category: 'layout', sourceComponent: 'UPLine', description: '线条组件' },
  { id: 'ScrollHost', title: 'ScrollHost 滚动容器', category: 'layout', sourceComponent: 'UPScrollHost', description: '滚动容器组件' },
  { id: 'Sticky', title: 'Sticky 吸顶', category: 'layout', sourceComponent: 'UPSticky', description: '吸顶组件' },
  { id: 'SafeBottom', title: 'SafeBottom 安全区域', category: 'layout', sourceComponent: 'UPSafeBottom', description: '安全区域组件' },
  { id: 'BackTop', title: 'BackTop 返回顶部', category: 'layout', sourceComponent: 'UPBackTop', description: '返回顶部组件' },
  { id: 'List', title: 'List 列表', category: 'layout', sourceComponent: 'UPList', description: '列表组件' },
  { id: 'Copy', title: 'Copy 复制', category: 'basic', sourceComponent: 'UPCopy', description: '复制组件' },
  { id: 'LoadingIcon', title: 'LoadingIcon 加载图标', category: 'basic', sourceComponent: 'UPLoadingIcon', description: '加载图标组件' },
  { id: 'Transition', title: 'Transition 动画', category: 'basic', sourceComponent: 'UPTransition', description: '过渡动画组件' },
  { id: 'Calendar', title: 'Calendar 日历', category: 'form', sourceComponent: 'UPCalendar', description: '日历组件' },
  { id: 'CityLocate', title: 'CityLocate 城市定位', category: 'form', sourceComponent: 'UPCityLocate', description: '城市定位组件' },
  { id: 'Select', title: 'Select 经典下拉框', category: 'form', sourceComponent: 'UPSelect', description: '下拉选择组件' },
  { id: 'CateTab', title: 'CateTab 垂直TAB', category: 'navigation', sourceComponent: 'UPCateTab', description: '垂直分类标签组件' },
  { id: 'Loadmore', title: 'Loadmore 加载更多', category: 'display', sourceComponent: 'UPLoadmore', description: '加载更多组件' },
  { id: 'NoticeBar', title: 'NoticeBar 滚动通知', category: 'display', sourceComponent: 'UPNoticeBar', description: '滚动通知组件' },
  { id: 'ReadMore', title: 'ReadMore 展开阅读更多', category: 'display', sourceComponent: 'UPReadMore', description: '展开阅读组件' },
  { id: 'Table2', title: 'Table2 表格2', category: 'display', sourceComponent: 'UPTable2', description: '表格V2组件' },
  { id: 'NoNetwork', title: 'NoNetwork 无网络提示', category: 'feedback', sourceComponent: 'UPNoNetwork', description: '无网络提示组件' },
  { id: 'Overlay', title: 'Overlay 遮罩层', category: 'feedback', sourceComponent: 'UPOverlay', description: '遮罩层组件' },
  { id: 'FloatButton', title: 'FloatButton 悬浮按钮', category: 'feedback', sourceComponent: 'UPFloatButton', description: '悬浮按钮组件' },
  { id: 'Agreement', title: 'Agreement 弹窗协议', category: 'feedback', sourceComponent: 'UPAgreement', description: '弹窗协议组件' },
  { id: 'Cropper', title: 'Cropper 图片裁剪', category: 'advanced', sourceComponent: 'UPCropper', description: '图片裁剪组件' },
  { id: 'PdfReader', title: 'PdfReader PDF阅读器', category: 'advanced', sourceComponent: 'UPPdfReader', description: 'PDF阅读器组件' },
  { id: 'Poster', title: 'Poster 海报生成', category: 'advanced', sourceComponent: 'UPPoster', description: '海报生成组件' },
  { id: 'ShortVideo', title: 'ShortVideo 短视频切换', category: 'advanced', sourceComponent: 'UPShortVideo', description: '短视频组件' },
  { id: 'ScrollList', title: 'ScrollList 横向滚动列表', category: 'layout', sourceComponent: 'UPScrollList', description: '横向滚动列表组件' },
];


/**
 * 上游首页的分组表，顺序与 components.config.js 完全一致。
 * 末尾第 8 组是本地补充：上游索引未收录的子组件与 RN 独有组件，若不列出来
 * 它们的 demo 页在 app 里就点不到了。
 */
export const SOURCE_GROUPS: readonly SourceGroup[] = [
  {
    groupName: '基础组件',
    items: [
      { icon: 'color', id: null, title: 'Color 色彩' },
      { icon: 'icon', id: 'Icon', title: 'Icon 图标' },
      { icon: 'image', id: 'Image', title: 'Image 图片' },
      { icon: 'button', id: 'Button', title: 'Button 按钮' },
      { icon: 'text', id: 'Text', title: 'Text 文本' },
      { icon: 'layout', id: 'Row', title: 'Layout 布局' },
      { icon: 'cell', id: 'Cell', title: 'Cell 单元格' },
      { icon: 'badge', id: 'Badge', title: 'Badge 徽标数' },
      { icon: 'tag', id: 'Tag', title: 'Tag 标签' },
      { icon: 'loading', id: 'LoadingIcon', title: 'Loading 加载动画' },
      { icon: 'loading-page', id: 'LoadingPage', title: 'Loading page 加载页' },
    ],
  },
  {
    groupName: '表单组件',
    items: [
      { icon: 'form', id: 'Form', title: 'Form 表单' },
      { icon: 'calendar', id: 'Calendar', title: 'Calendar 日历' },
      { icon: 'keyboard', id: 'Keyboard', title: 'Keyboard 键盘' },
      { icon: 'picker', id: 'Picker', title: 'Picker 选择器' },
      { icon: 'picker', id: 'Select', title: 'Select 经典下拉框' },
      { icon: 'cascader', id: 'Cascader', title: 'Cascader 级联选择器' },
      { icon: 'choose', id: 'Choose', title: 'Choose 选项选择器' },
      { icon: 'datetimePicker', id: 'DatetimePicker', title: 'DatetimePicker 时间选择器' },
      { icon: 'rate', id: 'Rate', title: 'Rate 评分' },
      { icon: 'search', id: 'Search', title: 'Search 搜索' },
      { icon: 'numberBox', id: 'NumberBox', title: 'NumberBox 步进器' },
      { icon: 'upload', id: 'Upload', title: 'Upload 上传' },
      { icon: 'code', id: 'Code', title: 'Code 验证码倒计时' },
      { icon: 'field', id: 'Input', title: 'Input 输入框' },
      { icon: 'textarea', id: 'Textarea', title: 'Textarea 文本域' },
      { icon: 'checkbox', id: 'Checkbox', title: 'Checkbox 复选框' },
      { icon: 'radio', id: 'Radio', title: 'Radio 单选框' },
      { icon: 'switch', id: 'Switch', title: 'Switch 开关选择器' },
      { icon: 'slider', id: 'Slider', title: 'Slider 滑动选择器' },
      { icon: 'album', id: 'Album', title: 'Album 相册' },
    ],
  },
  {
    groupName: '数据组件',
    items: [
      { icon: 'list', id: 'List', title: 'List 列表' },
      { icon: 'virtualList', id: 'VirtualList', title: 'VirtualList 虚拟列表' },
      { icon: 'progress', id: 'LineProgress', title: 'Progress 进度条' },
      { icon: 'table', id: 'Table', title: 'Table 表格' },
      { icon: 'table', id: 'Table2', title: 'Table2 表格2' },
      { icon: 'countDown', id: 'CountDown', title: 'CountDown 倒计时' },
      { icon: 'countTo', id: 'CountTo', title: 'CountTo 数字滚动' },
    ],
  },
  {
    groupName: '反馈组件',
    items: [
      { icon: 'tooltip', id: 'Tooltip', title: 'Tooltip 长按提示' },
      { icon: 'tooltip', id: 'Guide', title: 'Guide 首屏引导' },
      { icon: 'popover', id: 'Popover', title: 'Popover 弹窗提示' },
      { icon: 'actionSheet', id: 'ActionSheet', title: 'ActionSheet 上拉菜单' },
      { icon: 'alert', id: 'Alert', title: 'Alert 警告提示' },
      { icon: 'toast', id: 'Toast', title: 'Toast 消息提示' },
      { icon: 'noticeBar', id: 'NoticeBar', title: 'NoticeBar 滚动通知' },
      { icon: 'notify', id: 'Notify', title: 'Notify 消息提示' },
      { icon: 'swipeAction', id: 'SwipeAction', title: 'SwipeAction 滑动单元格' },
      { icon: 'collapse', id: 'Collapse', title: 'Collapse 折叠面板' },
      { icon: 'popup', id: 'Popup', title: 'Popup 弹出层' },
      { icon: 'modal', id: 'Modal', title: 'Modal 模态框' },
      { icon: 'copy', id: 'Copy', title: 'Copy 复制' },
      { icon: 'copy', id: 'FloatButton', title: 'FloatButton 悬浮按钮' },
      { icon: 'pullRefresh', id: 'PullRefresh', title: 'PullRefresh 下拉刷新' },
      { icon: 'signature', id: 'Signature', title: 'Signature 签名签字' },
      { icon: 'agreement', id: 'Agreement', title: 'agreement 弹窗协议' },
    ],
  },
  {
    groupName: '布局组件',
    items: [
      { icon: 'scrollList', id: 'ScrollList', title: 'ScrollList 横向滚动列表' },
      { icon: 'line', id: 'Line', title: 'Line 线条' },
      { icon: 'empty', id: 'Card', title: 'Card 卡片' },
      { icon: 'mask', id: 'Overlay', title: 'Overlay 遮罩层' },
      { icon: 'noNetwork', id: 'NoNetwork', title: 'NoNetwork 无网络提示' },
      { icon: 'grid', id: 'Grid', title: 'Grid 宫格布局' },
      { icon: 'swiper', id: 'Swiper', title: 'Swiper 轮播图' },
      { icon: 'skeleton', id: 'Skeleton', title: 'Skeleton 骨架屏' },
      { icon: 'sticky', id: 'Sticky', title: 'Sticky 吸顶' },
      { icon: 'waterfall', id: 'Waterfall', title: 'Waterfall 瀑布流' },
      { icon: 'divider', id: 'Divider', title: 'Divider 分割线' },
      { icon: 'box', id: 'Box', title: 'Box 盒子' },
      { icon: 'box', id: 'CateTab', title: 'CateTab 垂直TAB' },
      { icon: 'title', id: 'Title', title: 'Title 标题' },
      { icon: 'shortVideo', id: 'ShortVideo', title: 'ShortVideo 短视频切换' },
    ],
  },
  {
    groupName: '导航组件',
    items: [
      { icon: 'dropdown', id: 'Dropdown', title: 'Dropdown 下拉菜单' },
      { icon: 'tabbar', id: 'Tabbar', title: 'Tabbar 底部导航栏' },
      { icon: 'backTop', id: 'BackTop', title: 'BackTop 返回顶部' },
      { icon: 'navbar', id: 'Navbar', title: 'Navbar 导航栏' },
      { icon: 'navbar', id: 'NavbarMini', title: 'NavbarMini 迷你导航栏' },
      { icon: 'tabs', id: 'Tabs', title: 'Tabs 标签' },
      { icon: 'subsection', id: 'Subsection', title: 'Subsection 分段器' },
      { icon: 'indexList', id: 'IndexList', title: 'IndexList 索引列表' },
      { icon: 'steps', id: 'Steps', title: 'Steps 步骤条' },
      { icon: 'empty', id: 'Empty', title: 'Empty 内容为空' },
      { icon: 'pagination', id: 'Pagination', title: 'Pagination 分页器' },
      { icon: 'tree', id: 'Tree', title: 'Tree 树形' },
    ],
  },
  {
    groupName: '其他组件',
    items: [
      { icon: 'parse', id: 'Parse', title: 'Parse 富文本解析器' },
      { icon: 'markdown', id: 'Markdown', title: 'Markdown 解析器' },
      { icon: 'messageInput', id: 'CodeInput', title: 'CodeInput 验证码输入' },
      { icon: 'dragsort', id: 'Dragsort', title: 'Dragsort 拖动排序' },
      { icon: 'cropper', id: 'Cropper', title: 'cropper 图片裁剪' },
      { icon: 'loadmore', id: 'Loadmore', title: 'Loadmore 加载更多' },
      { icon: 'readMore', id: 'ReadMore', title: 'ReadMore 展开阅读更多' },
      { icon: 'lazyLoad', id: 'LazyLoad', title: 'LazyLoad 懒加载' },
      { icon: 'gap', id: 'Gap', title: 'Gap 间隔槽' },
      { icon: 'avatar', id: 'Avatar', title: 'Avatar 头像' },
      { icon: 'link', id: 'Link', title: 'Link 超链接' },
      { icon: 'transition', id: 'Transition', title: 'transition 动画' },
      { icon: 'qrcode', id: 'Qrcode', title: 'Qrcode 二维码' },
      { icon: 'coupon', id: 'Coupon', title: 'Coupon 优惠券' },
      { icon: 'barcode', id: 'Barcode', title: 'Barcode 条码' },
      { icon: 'colorPicker', id: 'ColorPicker', title: 'ColorPicker 颜色选择器' },
      { icon: 'poster', id: 'Poster', title: 'Poster 海报生成' },
      { icon: 'goodsSku', id: 'GoodsSku', title: 'GoodsSku 商品SKU' },
      { icon: 'cityLocate', id: 'CityLocate', title: 'CityLocate 城市定位' },
      { icon: 'pdfReader', id: 'PdfReader', title: 'PdfReader PDF阅读器' },
      { icon: 'file-text', id: 'NovelReader', title: 'NovelReader 小说阅读器' },
    ],
  },
  {
    groupName: '本地扩展（源索引未收录）',
    items: [
      { icon: '', id: 'AvatarGroup', title: 'AvatarGroup 头像组' },
      { icon: '', id: 'FormItem', title: 'FormItem 表单项' },
      { icon: '', id: 'Toolbar', title: 'Toolbar 工具栏' },
      { icon: '', id: 'CellGroup', title: 'CellGroup 单元格组' },
      { icon: '', id: 'CircleProgress', title: 'CircleProgress 环形进度条' },
      { icon: '', id: 'Section', title: 'Section 内容区' },
      { icon: '', id: 'Canvas', title: 'Canvas 画布' },
      { icon: '', id: 'Col', title: 'Col 列布局' },
      { icon: '', id: 'GridItem', title: 'GridItem 网格项' },
      { icon: '', id: 'View', title: 'View 视图容器' },
      { icon: '', id: 'ScrollHost', title: 'ScrollHost 滚动容器' },
      { icon: '', id: 'SafeBottom', title: 'SafeBottom 安全区域' },
    ],
  },
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
