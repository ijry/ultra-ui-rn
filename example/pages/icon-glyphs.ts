/**
 * 上游索引 icon 名 → 本地字体字形名。
 *
 * 上游每行图标是 `/static/uview/demo/<icon>.png`，那 100 多张 PNG 没有随 demo 源码
 * 进仓库（只有图标字体 `uicon-iconfont.ttf` 进来了），所以按语义挑最接近的字形代替。
 * 102 个 icon 名里只有 12 个（bag / edit-pen / list / photo / chat / star-fill /
 * grid-fill / calendar / search / grid / coupon / file-text）在字体里同名，其余
 * 90 个是 demo 专用图名（numberBox、datetimePicker、shortVideo…），字体里没有对应
 * 物，只能人工映射。
 *
 * 这是**视觉近似，不是复刻**：形状与上游 PNG 不同，位置、尺寸、行结构一致。
 * 若日后把那批 PNG 补进 `example/assets/`，把这张表换成图片路径即可，
 * SOURCE_GROUPS 里保留的正是上游原始 icon 名。
 */
const ICON_GLYPH: Record<string, string> = {
  // 分组表头（上游同名字形，直接可用）
  bag: 'bag',
  chat: 'chat',
  'edit-pen': 'edit-pen',
  'grid-fill': 'grid-fill',
  list: 'list',
  photo: 'photo',
  'star-fill': 'star-fill',

  // 基础
  badge: 'info-circle-fill',
  button: 'checkmark-circle',
  cell: 'list',
  color: 'photo',
  icon: 'star',
  image: 'photo',
  layout: 'grid',
  loading: 'hourglass',
  'loading-page': 'hourglass-half-fill',
  tag: 'tags',
  text: 'file-text',

  // 表单
  album: 'photo-fill',
  calendar: 'calendar',
  cascader: 'level',
  checkbox: 'checkbox-mark',
  choose: 'checkbox-mark',
  code: 'lock',
  datetimePicker: 'clock',
  field: 'edit-pen',
  form: 'edit-pen',
  keyboard: 'grid',
  numberBox: 'plus-circle',
  picker: 'list-dot',
  radio: 'checkmark-circle',
  rate: 'star',
  search: 'search',
  slider: 'column-line',
  switch: 'setting',
  textarea: 'file-text',
  upload: 'arrow-upward',

  // 数据
  countDown: 'clock-fill',
  countTo: 'integral',
  progress: 'hourglass-half-fill',
  table: 'grid',
  virtualList: 'list-dot',

  // 反馈
  actionSheet: 'list',
  agreement: 'file-text-fill',
  alert: 'warning',
  collapse: 'arrow-down',
  copy: 'attach',
  modal: 'question-circle',
  noticeBar: 'volume',
  notify: 'bell',
  popover: 'chat-fill',
  popup: 'more-circle',
  pullRefresh: 'reload',
  signature: 'edit-pen-fill',
  swipeAction: 'arrow-leftward',
  toast: 'info-circle',
  tooltip: 'chat',

  // 布局
  box: 'folder',
  divider: 'column-line',
  empty: 'empty-data',
  grid: 'grid',
  line: 'column-line',
  mask: 'eye-off',
  noNetwork: 'wifi-off',
  scrollList: 'arrow-rightward',
  shortVideo: 'movie',
  skeleton: 'empty-page',
  sticky: 'pushpin',
  swiper: 'photo',
  title: 'file-text',
  waterfall: 'grid-fill',

  // 导航
  backTop: 'arrow-upward',
  dropdown: 'arrow-down-fill',
  indexList: 'list',
  navbar: 'list',
  pagination: 'arrow-right-double',
  steps: 'level',
  subsection: 'grid',
  tabbar: 'grid',
  tabs: 'list-dot',
  tree: 'level',

  // 其他
  avatar: 'account',
  barcode: 'scan',
  cityLocate: 'map',
  colorPicker: 'photo',
  coupon: 'coupon',
  cropper: 'cut',
  dragsort: 'list-dot',
  'file-text': 'file-text',
  gap: 'column-line',
  goodsSku: 'shopping-cart',
  lazyLoad: 'photo',
  link: 'share',
  loadmore: 'more-dot-fill',
  markdown: 'file-text-fill',
  messageInput: 'chat',
  parse: 'file-text',
  pdfReader: 'file-text',
  poster: 'photo-fill',
  qrcode: 'scan',
  readMore: 'arrow-down',
  transition: 'play-circle',
};

/** 上游索引未收录的本地组件没有 icon 名，给一个中性字形。 */
const FALLBACK_GLYPH = 'grid';

export function iconGlyphFor(upstreamIcon: string): string {
  return ICON_GLYPH[upstreamIcon] || FALLBACK_GLYPH;
}
