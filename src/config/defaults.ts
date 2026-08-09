import { sourceLightColors } from './colors';
import { sourceZIndex } from './z-index';
import type { UPCanvasAdapterComponent } from '../components/canvas';
import type { UPDimension } from '../utils';

const sourceNow = new Date();
const datetimePickerMinDate = new Date(sourceNow.getFullYear() - 10, 0, 1).getTime();
const datetimePickerMaxDate = new Date(sourceNow.getFullYear() + 10, 0, 1).getTime();

export type UPComponentType =
  | 'info'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error';

export type UPButtonDefaults = {
  hairline: boolean;
  type: 'info' | 'primary' | 'success' | 'warning' | 'error';
  size: 'large' | 'normal' | 'small' | 'mini';
  shape: 'circle' | 'square';
  plain: boolean;
  disabled: boolean;
  loading: boolean;
  loadingText: string;
  loadingMode: string;
  loadingSize: number;
  openType: string;
  formType: string;
  appParameter: string;
  hoverStopPropagation: boolean;
  lang: string;
  sessionFrom: string;
  sendMessageTitle: string;
  sendMessagePath: string;
  sendMessageImg: string;
  showMessageCard: boolean;
  dataName: string;
  throttleTime: number;
  hoverStartTime: number;
  hoverStayTime: number;
  text: string;
  icon: string;
  iconColor: string;
  color: string;
  stop: boolean;
};

export type UPIconDefaults = {
  name: string;
  color: string;
  size: string;
  bold: boolean;
  index: string;
  hoverClass: string;
  customPrefix: string;
  label: string;
  labelPos: 'left' | 'right' | 'top' | 'bottom';
  labelSize: string;
  labelColor: string;
  space: string;
  imgMode: string;
  width: string;
  height: string;
  top: number;
  stop: boolean;
};

export type UPTextDefaults = {
  type: '' | UPComponentType | 'main' | 'content' | 'tips' | 'light';
  show: boolean;
  text: string;
  prefixIcon: string;
  suffixIcon: string;
  mode: string;
  href: string;
  format: string;
  call: boolean;
  openType: string;
  bold: boolean;
  block: boolean;
  lines: string;
  color: string;
  size: number;
  iconStyle: { fontSize: string };
  decoration: 'none' | 'underline' | 'line-through';
  margin: number;
  lineHeight: string;
  align: 'left' | 'center' | 'right';
  wordWrap: 'normal' | 'break-word' | 'anywhere';
  flex1: boolean;
};

export type UPTagDefaults = {
  type: UPComponentType;
  disabled: boolean;
  size: 'large' | 'medium' | 'mini';
  shape: 'circle' | 'square';
  text: string;
  bgColor: string;
  color: string;
  borderColor: string;
  closeColor: string;
  name: string;
  plainFill: boolean;
  plain: boolean;
  closable: boolean;
  show: boolean;
  icon: string;
  iconColor: string;
  textSize: string;
  height: string;
  padding: string;
  borderRadius: string;
  autoBgColor: number;
};

export type UPBadgeDefaults = {
  isDot: boolean;
  value: string;
  show: boolean;
  max: number;
  type: UPComponentType;
  showZero: boolean;
  bgColor: string | null;
  color: string | null;
  shape: 'circle' | 'horn';
  numberType: 'overflow' | 'ellipsis' | 'limit';
  offset: string[];
  inverted: boolean;
  absolute: boolean;
};

export type UPGapDefaults = {
  bgColor: string;
  height: number | string;
  marginTop: number | string;
  marginBottom: number | string;
};

export type UPLineDefaults = {
  color: string;
  length: string;
  direction: 'row' | 'col';
  hairline: boolean;
  margin: number;
  dashed: boolean;
};

export type UPDividerDefaults = {
  dashed: boolean;
  hairline: boolean;
  dot: boolean;
  textPosition: 'left' | 'center' | 'right';
  text: string;
  textSize: number;
  textColor: string;
  lineColor: string;
};

export type UPSectionDefaults = {
  title: string;
  subTitle: string;
  right: boolean;
  fontSize: number;
  bold: boolean;
  color: string;
  subColor: string;
  showLine: boolean;
  lineColor: string;
  arrow: boolean;
};

export type UPBoxDefaults = {
  bgColors: [string, string, string];
  height: string;
  borderRadius: string;
  gap: string;
  leftIcon: string;
  leftTitle: string;
  rightTopIcon: string;
  rightTopTitle: string;
  rightBottomIcon: string;
  rightBottomTitle: string;
};

export type UPCellDefaults = {
  customClass: string;
  title: string;
  label: string;
  value: string;
  icon: string;
  disabled: boolean;
  border: boolean;
  center: boolean;
  url: string;
  linkType: string;
  clickable: boolean;
  isLink: boolean;
  required: boolean;
  arrowDirection: string;
  iconStyle: Record<string, never>;
  rightIconStyle: Record<string, never>;
  rightIcon: string;
  titleStyle: Record<string, never>;
  size: string;
  stop: boolean;
  name: string;
};

export type UPCellGroupDefaults = {
  title: string;
  border: boolean;
};

export type UPImageDefaults = {
  src: string;
  mode: string;
  width: string;
  height: string;
  shape: 'circle' | 'square';
  radius: number;
  lazyLoad: boolean;
  showMenuByLongpress: boolean;
  loadingIcon: string;
  errorIcon: string;
  showLoading: boolean;
  showError: boolean;
  fade: boolean;
  webp: boolean;
  duration: number;
  bgColor: string;
};

export type UPAvatarDefaults = {
  src: string;
  shape: 'circle' | 'square';
  size: number;
  mode: string;
  text: string;
  bgColor: string;
  color: string;
  fontSize: number;
  icon: string;
  mpAvatar: boolean;
  randomBgColor: boolean;
  defaultUrl: string;
  colorIndex: string;
  name: string;
};

export type UPCardDefaults = {
  full: boolean;
  title: string;
  titleColor: string;
  titleSize: string;
  subTitle: string;
  subTitleColor: string;
  subTitleSize: string;
  border: boolean;
  index: string;
  margin: string;
  borderRadius: string;
  headStyle: Record<string, never>;
  bodyStyle: Record<string, never>;
  footStyle: Record<string, never>;
  headBorderBottom: boolean;
  footBorderTop: boolean;
  thumb: string;
  thumbWidth: string;
  thumbCircle: boolean;
  padding: string;
  paddingHead: string;
  paddingBody: string;
  paddingFoot: string;
  showHead: boolean;
  showFoot: boolean;
  boxShadow: string;
};

export type UPEmptyDefaults = {
  icon: string;
  text: string;
  textColor: string;
  textSize: number;
  iconColor: string;
  iconSize: number;
  mode: string;
  width: number;
  height: number;
  show: boolean;
  marginTop: number;
};

export type UPSkeletonDefaults = {
  loading: boolean;
  animate: boolean;
  rows: number;
  rowsWidth: string;
  rowsHeight: number;
  title: boolean;
  titleWidth: string;
  titleHeight: number;
  avatar: boolean;
  avatarSize: number;
  avatarShape: 'circle' | 'square';
};

export type UPRowDefaults = {
  gutter: number;
  justify: string;
  align: string;
};

export type UPColDefaults = {
  span: number;
  offset: number;
  justify: string;
  align: string;
  textAlign: string;
};

export type UPGridDefaults = {
  col: number;
  border: boolean;
  align: string;
};

export type UPGridItemDefaults = {
  name: null;
  bgColor: string;
};

export type UPInputDefaults = {
  value: string;
  type: string;
  fixed: boolean;
  disabled: boolean;
  disabledColor: string;
  clearable: boolean;
  password: boolean;
  maxlength: number;
  placeholder: null;
  placeholderClass: string;
  placeholderStyle: string;
  showWordLimit: boolean;
  confirmType: string;
  confirmHold: boolean;
  holdKeyboard: boolean;
  focus: boolean;
  autoBlur: boolean;
  disableDefaultPadding: boolean;
  cursor: number;
  cursorSpacing: number;
  selectionStart: number;
  selectionEnd: number;
  adjustPosition: boolean;
  inputAlign: 'left' | 'center' | 'right';
  fontSize: string;
  color: string;
  prefixIcon: string;
  prefixIconStyle: string;
  suffixIcon: string;
  suffixIconStyle: string;
  border: 'surround' | 'bottom' | 'none';
  readonly: boolean;
  shape: 'circle' | 'square';
  cursorColor: string;
  passwordVisibilityToggle: boolean;
};

export type UPPickerDefaults = {
  show: boolean;
  popupMode: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showToolbar: boolean;
  title: string;
  columns: readonly (readonly unknown[])[];
  loading: boolean;
  itemHeight: number;
  cancelText: string;
  confirmText: string;
  cancelColor: string;
  confirmColor: string;
  visibleItemCount: number;
  keyName: string;
  valueName: string;
  closeOnClickOverlay: boolean;
  defaultIndex: readonly number[];
  immediateChange: boolean;
  zIndex: number;
  disabled: boolean;
  disabledColor: string;
  placeholder: string;
  inputProps: Record<string, never>;
  bgColor: string;
  round: number;
  duration: number;
  overlayOpacity: number;
  pageInline: boolean;
};

export type UPDatetimePickerDefaults = {
  show: boolean;
  popupMode: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showToolbar: boolean;
  title: string;
  mode: 'date' | 'time' | 'year-month' | 'datetime' | 'datehour' | 'timesecond' | 'datetimesecond';
  minDate: number;
  maxDate: number;
  minHour: number;
  maxHour: number;
  minMinute: number;
  maxMinute: number;
  minSecond: number;
  maxSecond: number;
  filter: null;
  formatter: null;
  loading: boolean;
  itemHeight: number;
  cancelText: string;
  confirmText: string;
  cancelColor: string;
  confirmColor: string;
  visibleItemCount: number;
  closeOnClickOverlay: boolean;
  defaultIndex: readonly number[];
  zIndex: number;
  disabled: boolean;
  disabledColor: string;
  placeholder: string;
  inputProps: Record<string, never>;
  bgColor: string;
  round: number;
  duration: number;
  overlayOpacity: number;
  pageInline: boolean;
};

export type UPCascaderDefaults = {
  show: boolean;
  data: readonly Record<string, unknown>[];
  modelValue: readonly (string | number | boolean | null)[];
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  maskCloseAble: boolean;
  zIndex: number;
  autoClose: boolean;
  headerDirection: 'row' | 'column';
  optionsCols: 1 | 2;
  closeable: boolean;
};

export type UPCityLocateDefaults = {
  indexList: readonly string[];
  cityList: readonly (readonly Record<string, unknown>[])[];
  locationType: string;
  currentCity: string;
  nameKey: string;
};

export type UPTextareaDefaults = {
  value: string;
  placeholder: string;
  placeholderClass: string;
  placeholderStyle: string;
  height: number;
  confirmType: string;
  disabled: boolean;
  count: boolean;
  focus: boolean;
  autoHeight: boolean;
  fixed: boolean;
  cursorSpacing: number;
  cursor: string;
  showConfirmBar: boolean;
  selectionStart: number;
  selectionEnd: number;
  adjustPosition: boolean;
  disableDefaultPadding: boolean;
  holdKeyboard: boolean;
  maxlength: number;
  border: 'surround' | 'bottom';
};

export type UPSearchDefaults = {
  shape: 'round' | 'square';
  bgColor: string;
  placeholder: string;
  clearabled: boolean;
  focus: boolean;
  showAction: boolean;
  actionText: string;
  inputAlign: 'left' | 'center' | 'right';
  disabled: boolean;
  borderColor: string;
  searchIconColor: string;
  searchIconSize: number;
  color: string;
  placeholderColor: string;
  searchIcon: string;
  iconPosition: 'left' | 'right';
  margin: string;
  animation: boolean;
  value: string;
  maxlength: string;
  height: number;
  label: null;
  adjustPosition: boolean;
  autoBlur: boolean;
};

export type UPSwitchDefaults = { loading: boolean; disabled: boolean; size: number; activeColor: string; inactiveColor: string; dotActiveColor: string; dotInactiveColor: string; value: boolean; activeValue: boolean; inactiveValue: boolean; asyncChange: boolean; space: number; };
export type UPCheckboxDefaults = { name: string; shape: string; size: string; checked: boolean; disabled: string; activeColor: string; inactiveColor: string; iconSize: string; iconColor: string; label: string; labelSize: string; labelColor: string; labelDisabled: string; };
export type UPCheckboxGroupDefaults = { name: string; value: readonly string[]; shape: 'square' | 'circle'; disabled: boolean; activeColor: string; inactiveColor: string; size: number; placement: 'row' | 'column'; labelSize: number; labelColor: string; labelDisabled: boolean; iconColor: string; iconSize: number; iconPlacement: 'left' | 'right'; borderBottom: boolean; };
export type UPRadioDefaults = { name: string; shape: string; disabled: string; labelDisabled: string; activeColor: string; inactiveColor: string; iconSize: string; labelSize: string; label: string; labelColor: string; size: string; iconColor: string; placement: string; };
export type UPRadioGroupDefaults = { value: string; disabled: boolean; shape: 'square' | 'circle'; activeColor: string; inactiveColor: string; name: string; size: number; placement: 'row' | 'column'; label: string; labelColor: string; labelSize: number; labelDisabled: boolean; iconColor: string; iconSize: number; borderBottom: boolean; iconPlacement: 'left' | 'right'; gap: string; };
export type UPRateDefaults = { value: number; count: number; disabled: boolean; size: number; inactiveColor: string; activeColor: string; gutter: number; minCount: number; allowHalf: boolean; activeIcon: string; inactiveIcon: string; touchable: boolean; };
export type UPSliderDefaults = { value: number; blockSize: number; min: number; max: number; step: number; activeColor: string; inactiveColor: string; blockColor: string; showValue: boolean; disabled: boolean; useNative: boolean; height: string; size: string; length: string; vertical: boolean; };
export type UPNumberBoxDefaults = { name: string; value: number; min: number; max: number; step: number; integer: boolean; disabled: boolean; disabledInput: boolean; asyncChange: boolean; inputWidth: number; showMinus: boolean; showPlus: boolean; decimalLength: null; longPress: boolean; color: string; buttonWidth: number; buttonSize: number; buttonRadius: string; bgColor: string; disabledBgColor: string; inputBgColor: string; cursorSpacing: number; disableMinus: boolean; disablePlus: boolean; iconStyle: string; miniMode: boolean; };
export type UPCodeInputDefaults = { adjustPosition: boolean; maxlength: number; dot: boolean; mode: 'box' | 'line'; hairline: boolean; space: number; value: string; focus: boolean; bold: boolean; color: string; fontSize: number; size: number; disabledKeyboard: boolean; borderColor: string; disabledDot: boolean; };
export type UPCodeDefaults = { seconds: number; startText: string; changeText: string; endText: string; keepRunning: boolean; uniqueKey: string; };
export type UPKeyboardDefaults = { mode: 'number' | 'card' | 'car'; dotDisabled: boolean; tooltip: boolean; showTips: boolean; tips: string; showCancel: boolean; showConfirm: boolean; random: boolean; safeAreaInsetBottom: boolean; closeOnClickOverlay: boolean; show: boolean; overlay: boolean; zIndex: number; cancelText: string; confirmText: string; autoChange: boolean; };
export type UPNumberKeyboardDefaults = { mode: 'number' | 'card'; dotDisabled: boolean; random: boolean; };
export type UPCarKeyboardDefaults = { random: boolean; };
export type UPTooltipDefaults = { text: string; copyText: string; size: number; color: string; bgColor: string; popupBgColor: string; direction: 'top' | 'bottom' | 'left' | 'right'; zIndex: number; showCopy: boolean; buttons: readonly (string | number)[]; overlay: boolean; showToast: boolean; triggerMode: 'click' | 'longpress' | 'manual' | 'hover'; forcePosition: Record<string, never>; show: boolean; singleton: boolean; };
export type UPDropdownDefaults = { activeColor: string; inactiveColor: string; closeOnClickMask: boolean; closeOnClickSelf: boolean; duration: number; height: number; borderBottom: boolean; titleSize: number; borderRadius: number; menuIcon: string; menuIconSize: number; };
export type UPDropdownItemDefaults = { modelValue: string | number | readonly (string | number)[]; title: string; options: readonly Record<string, unknown>[]; disabled: boolean; height: string; closeOnClickOverlay: boolean; };
export type UPNavbarDefaults = { safeAreaInsetTop: boolean; placeholder: boolean; fixed: boolean; border: boolean; leftIcon: string; leftText: string; rightText: string; rightIcon: string; title: string | number; titleColor: string; bgColor: string; statusBarBgColor: string; titleWidth: string | number; height: string | number; leftIconSize: string | number; leftIconColor: string; autoBack: boolean; titleStyle: Record<string, never>; };
export type UPNavbarMiniDefaults = { safeAreaInsetTop: boolean; placeholder: boolean; fixed: boolean; leftIcon: string; bgColor: string; height: string | number; iconSize: string | number; iconColor: string; leftIconColor: string; autoBack: boolean; homeUrl: string; };
export type UPCateTabDefaults = { mode: 'follow' | 'tab'; height: string | number; tabList: readonly Record<string, unknown>[]; tabKeyName: string; itemKeyName: string; current: number; animated: boolean; };
export type UPTabbarDefaults = { value: string | number | null; safeAreaInsetBottom: boolean; border: boolean; borderColor: string; zIndex: number; activeColor: string; inactiveColor: string; fixed: boolean; placeholder: boolean; backgroundColor: string; styleType: string; animationType: string; activeBackgroundColor: string; inactiveBackgroundColor: string; itemShape: string; iconScale: number; textMode: string; };
export type UPTabbarItemDefaults = { name: string | number | null; icon: string; activeIcon: string; inactiveIcon: string; badge: string | number | null; dot: boolean; text: string; badgeStyle: string; mode: string; activeClass: string; inactiveClass: string; midButtonBgColor: string; midButtonIconColor: string; midButtonIconSize: number; midButtonBoxShadow: string; midButtonInnerBoxShadow: string; midButtonOffsetY: number; };
export type UPFormDefaults = { model: Record<string, unknown>; rules: Record<string, unknown>; errorType: 'message' | 'toast' | 'border-bottom' | 'none'; borderBottom: boolean; labelPosition: 'left' | 'top'; labelWidth: number; labelAlign: 'left' | 'center' | 'right'; labelStyle: Record<string, unknown>; };
export type UPFormItemDefaults = { label: string; prop: string; rules: readonly unknown[]; borderBottom: ''; labelPosition: ''; labelWidth: ''; rightIcon: string; leftIcon: string; required: boolean; leftIconStyle: string; };
export type UPTransitionDefaults = { show: boolean; mode: 'fade'; duration: string; timingFunction: string; };
export type UPOverlayDefaults = { show: boolean; zIndex: number; duration: number; opacity: number; };
export type UPPopupDefaults = { show: boolean; overlay: boolean; mode: 'top' | 'bottom' | 'left' | 'right' | 'center'; duration: number; closeable: boolean; overlayStyle: Record<string, never>; closeOnClickOverlay: boolean; zIndex: number; safeAreaInsetBottom: boolean; safeAreaInsetTop: boolean; closeIconPos: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; round: string; zoom: boolean; bgColor: string; overlayOpacity: number; pageInline: boolean; touchable: boolean; minHeight: string; maxHeight: string; };
export type UPModalDefaults = { show: boolean; title: string; content: string; confirmText: string; cancelText: string; showConfirmButton: boolean; showCancelButton: boolean; confirmColor: string; cancelColor: string; buttonReverse: boolean; zoom: boolean; asyncClose: boolean; closeOnClickOverlay: boolean; negativeTop: number; width: string; confirmButtonShape: string; duration: number; contentTextAlign: 'left' | 'center' | 'right'; asyncCloseTip: string; asyncCancelClose: boolean; contentStyle: Record<string, never>; };
export type UPActionSheetDefaults = { show: boolean; title: string; description: string; actions: readonly Record<string, unknown>[]; nameKey: string; subnameKey: string; index: string; cancelText: string; closeOnClickAction: boolean; safeAreaInsetBottom: boolean; openType: string; closeOnClickOverlay: boolean; round: number; wrapMaxHeight: string; };
export type UPLoadingIconDefaults = { show: boolean; color: string; textColor: string; vertical: boolean; mode: 'spinner' | 'circle' | 'semicircle'; size: number; textSize: number; text: string; timingFunction: string; duration: number; inactiveColor: string; };
export type UPLoadingPageDefaults = { loadingText: string; image: string; loadingMode: 'spinner' | 'circle' | 'semicircle'; loading: boolean; bgColor: string; color: string; fontSize: number; iconSize: number; loadingColor: string; zIndex: number; };
export type UPToastDefaults = { zIndex: number; loading: boolean; message: string; icon: string; type: string; loadingMode: string; show: boolean; overlay: boolean; position: 'top' | 'center' | 'bottom'; params: Record<string, never>; duration: number; isTab: boolean; url: string; back: boolean; };
export type UPNotifyDefaults = { top: number; type: 'primary' | 'success' | 'warning' | 'error'; color: string; bgColor: string; message: string; duration: number; fontSize: number; safeAreaInsetTop: boolean; };
export type UPLineProgressDefaults = { activeColor: string; inactiveColor: string; percentage: number; showText: boolean; height: number; fromRight: boolean; };
export type UPCircleProgressDefaults = { percentage: number; };
export type UPLoadmoreDefaults = { status: 'loadmore' | 'loading' | 'nomore'; bgColor: string; icon: boolean; fontSize: number; iconSize: number; color: string; loadingIcon: 'spinner' | 'circle' | 'semicircle'; loadmoreText: string; loadingText: string; nomoreText: string; isDot: boolean; iconColor: string; marginTop: number; marginBottom: number; height: string; line: boolean; lineColor: string; dashed: boolean; };
export type UPPullRefreshDefaults = { refreshing: boolean; threshold: number; damping: number; maxDistance: number; showLoadmore: boolean; loadmoreProps: { status: 'loadmore' }; useScrollView: boolean; enableBackToTop: boolean; lowerThreshold: number; scrollTop: number; height: string; };
export type UPCountDownDefaults = { time: number; format: string; autoStart: boolean; millisecond: boolean; };
export type UPCountToDefaults = { startVal: number; endVal: number; duration: number; autoplay: boolean; decimals: number; useEasing: boolean; decimal: string; color: string; fontSize: number; bold: boolean; separator: string; };
export type UPStatusBarDefaults = { bgColor: string; height: number; };
export type UPSafeBottomDefaults = Record<string, unknown>;
export type UPNoticeBarDefaults = { text: readonly string[]; direction: string; step: boolean; icon: string; mode: string; color: string; bgColor: string; speed: number; fontSize: number; duration: number; disableTouch: boolean; url: string; linkType: string; justifyContent: string; };
export type UPColumnNoticeDefaults = { text: readonly string[]; icon: string; mode: string; color: string; bgColor: string; fontSize: number; speed: number; step: boolean; duration: number; disableTouch: boolean; justifyContent: string; };
export type UPRowNoticeDefaults = { text: string; icon: string; mode: string; color: string; bgColor: string; fontSize: number; speed: number; };
export type UPSwipeActionDefaults = { autoClose: boolean; };
export type UPSwipeActionItemDefaults = { show: boolean; closeOnClick: boolean; name: string; disabled: boolean; autoClose: boolean; threshold: number; options: readonly unknown[]; duration: number; };
export type UPReadMoreDefaults = { showHeight: number; toggle: boolean; closeText: string; openText: string; color: string; fontSize: number; textIndent: string; name: string; };
export type UPStickyDefaults = { offsetTop: number; customNavHeight: number; disabled: boolean; bgColor: string; zIndex: string; index: string; };
export type UPBackTopDefaults = { mode: string; icon: string; text: string; duration: number; scrollTop: number; top: number; bottom: number; right: number; zIndex: number; iconStyle: { color: string; fontSize: string }; };
export type UPLinkDefaults = { color: string; fontSize: number; underLine: boolean; href: string; mpTips: string; lineColor: string; text: string; };
export type UPAlertDefaults = { title: string; type: 'primary' | 'success' | 'warning' | 'error' | 'info'; description: string; closable: boolean; showIcon: boolean; effect: 'light' | 'dark'; center: boolean; fontSize: number; transitionMode: string; duration: number; icon: string; value: boolean; };
export type UPAvatarGroupDefaults = { urls: readonly unknown[]; maxCount: number; shape: 'circle' | 'square'; mode: string; showMore: boolean; size: number; keyName: string; gap: number; extraValue: number; };
export type UPAlbumDefaults = { urls: readonly unknown[]; keyName: string; singleSize: number; multipleSize: number; space: number; singleMode: string; multipleMode: string; maxCount: number; previewFullImage: boolean; rowCount: number; showMore: boolean; autoWrap: boolean; unit: string; stop: boolean; };
export type UPUploadDefaults = { accept: 'image' | 'file' | 'all'; autoUpload: boolean; capture: boolean | 'camera' | 'album'; deletable: boolean; disabled: boolean; fileList: readonly unknown[]; formData: Record<string, unknown>; header: Record<string, string>; maxCount: number; maxSize: number; multiple: boolean; name: string; previewImage: boolean; uploadText: string; url: string; };
export type UPLazyLoadDefaults = { height: UPDimension; mode: string; once: boolean; threshold: number; width: UPDimension; };
export type UPIndexListDefaults = { inactiveColor: string; activeColor: string; indexList: readonly unknown[]; sticky: boolean; customNavHeight: number; safeBottomFix: boolean; itemMargin: string; };
export type UPIndexAnchorDefaults = { text: string; color: string; size: number; bgColor: string; height: number; };
export type UPSubsectionDefaults = { list: readonly unknown[]; current: number; activeColor: string; inactiveColor: string; mode: 'button' | 'subsection'; fontSize: number; bold: boolean; bgColor: string; keyName: string; activeColorKeyName: string; inactiveColorKeyName: string; disabled: boolean; };
export type UPCollapseDefaults = { value: string | number | readonly (string | number)[] | null; accordion: boolean; border: boolean; };
export type UPCollapseItemDefaults = { title: string; value: string; label: string; disabled: boolean; isLink: boolean; clickable: boolean; border: boolean; align: 'left' | 'center' | 'right'; name: string; icon: string; duration: number; showRight: boolean; titleStyle: Record<string, never>; iconStyle: Record<string, never>; rightIconStyle: Record<string, never>; cellCustomStyle: Record<string, never>; cellCustomClass: string; };
export type UPStepsDefaults = { direction: 'row' | 'column'; current: number; activeColor: string; inactiveColor: string; activeIcon: string; inactiveIcon: string; dot: boolean; };
export type UPStepsItemDefaults = { title: string; desc: string; iconSize: number; error: boolean; };
export type UPToolbarDefaults = { show: boolean; cancelText: string; confirmText: string; cancelColor: string; confirmColor: string; title: string; rightSlot: boolean; };
export type UPScrollListDefaults = { indicatorWidth: number; indicatorBarWidth: number; indicator: boolean; indicatorColor: string; indicatorActiveColor: string; indicatorStyle: Record<string, never>; };
export type UPTabsDefaults = { duration: number; list: readonly Record<string, unknown>[]; lineColor: string; activeStyle: { color: string }; inactiveStyle: { color: string }; lineWidth: number; lineHeight: number; lineBgSize: string; itemStyle: { height: string }; scrollable: boolean; current: number; keyName: string; iconStyle: Record<string, never>; shapeMode: string; };
export type UPPaginationDefaultSize = number | string | { label?: string; value: number | string };
export type UPPaginationDefaults = { currentPage: number; pageSize: number; total: number; prevText: string; nextText: string; buttonBgColor: string; buttonBorderColor: string; pageSizes: readonly UPPaginationDefaultSize[]; layout: string; hideOnSinglePage: boolean; };
export type UPTableDefaults = { borderColor: string; align: 'left' | 'center' | 'right'; padding: string; fontSize: string; color: string; thStyle: Record<string, never>; bgColor: string; };
export type UPSwiperDefaults = { list: readonly unknown[]; indicator: boolean; indicatorActiveColor: string; indicatorInactiveColor: string; indicatorStyle: Record<string, never>; indicatorMode: 'line' | 'dot'; autoplay: boolean; current: number; currentItemId: string; interval: number; duration: number; circular: boolean; vertical: boolean; previousMargin: number; nextMargin: number; acceleration: boolean; displayMultipleItems: number; easingFunction: string; keyName: string; imgMode: string; height: number; bgColor: string; radius: number; loading: boolean; showTitle: boolean; };
export type UPSwiperIndicatorDefaults = { length: number; current: number; indicatorActiveColor: string; indicatorInactiveColor: string; indicatorMode: 'line' | 'dot'; };
export type UPListDefaults = { showScrollbar: boolean; lowerThreshold: number | string; upperThreshold: number | string; scrollTop: number | string; offsetAccuracy: number | string; enableFlex: boolean; pagingEnabled: boolean; scrollable: boolean; scrollIntoView: string; scrollWithAnimation: boolean; enableBackToTop: boolean; height: number | string; width: number | string; preLoadScreen: number | string; refresherEnabled: boolean; refresherThreshold: number; refresherDefaultStyle: string; refresherBackground: string; refresherTriggered: boolean; };
export type UPListItemDefaults = { anchor: string; };
export type UPVirtualListDefaults = { listData: readonly unknown[]; itemHeight: number; height: string; buffer: number; keyField: string; scrollTop: number; };
export type UPRefreshVirtualListDefaults = { listData: readonly unknown[]; itemHeight: number; height: string; buffer: number; keyField: string; scrollTop: number; threshold: number; refreshing: boolean; };
export type UPDragsortDefaults = { columns: number; direction: 'vertical' | 'horizontal' | 'all'; draggable: boolean; initialList: readonly unknown[]; itemHeight: UPDimension; itemWidth: UPDimension; vibrate: boolean; };
export type UPSignatureDefaults = { bgColor: string; color: string; height: UPDimension; presetColors: readonly string[]; showToolbar: boolean; thickness: number; width: UPDimension; };
export type UPGuideDefaultPage = { backgroundColor?: string; desc?: string; image?: string; title?: string; };
export type UPGuideDefaults = { bgColor: string; finishText: string; indicator: boolean; list: readonly UPGuideDefaultPage[]; nextText: string; once: boolean; show: boolean; showSkip: boolean; skipText: string; storageKey: string; zIndex: number; };
export type UPAgreementDefaults = { urlProtocol: string; urlPrivacy: string; };
export type UPNoNetworkDefaults = { tips: string; zIndex: string; image: string; };
export type UPFloatButtonDefaultItem = { name: string; backgroundColor?: string; color?: string; borderColor?: string; [key: string]: unknown; };
export type UPFloatButtonDefaults = { backgroundColor: string; color: string; width: string; height: string; borderColor: string; right: string; top: string; bottom: string; isMenu: boolean; list: readonly UPFloatButtonDefaultItem[]; };
export type UPCopyDefaults = { content: string; alertStyle: string; notice: string; };
export type UPChooseOption = Record<string, unknown>;
export type UPChooseModelValue = number | string | readonly unknown[] | false;
export type UPChooseDefaults = { options: readonly UPChooseOption[]; modelValue: UPChooseModelValue; type: string; itemWidth: string; itemHeight: string; itemPadding: string; labelName: string; valueName: string; customClick: boolean; wrap: boolean; };
export type UPCalendarDefaultDate = string | number | Date;
export type UPCalendarDefaults = { title: string; showTitle: boolean; showSubtitle: boolean; mode: 'single' | 'multiple' | 'range'; startText: string; endText: string; customList: readonly Record<string, unknown>[]; color: string; minDate: number; maxDate: number; defaultDate: UPCalendarDefaultDate | readonly UPCalendarDefaultDate[] | null; maxCount: number; rowHeight: number; formatter: null; showLunar: boolean; showMark: boolean; confirmText: string; confirmDisabledText: string; show: boolean; closeOnClickOverlay: boolean; readonly: boolean; showConfirm: boolean; maxRange: number; rangePrompt: string; showRangePrompt: boolean; allowSameDay: boolean; rangeResultMode: 'all' | 'boundary'; enableTime: boolean; timePrecision: 'hour' | 'minute' | 'second'; defaultTime: string; round: number; overlay: boolean; duration: number; overlayStyle: Record<string, never>; overlayOpacity: number; zIndex: number; safeAreaInsetBottom: boolean; safeAreaInsetTop: boolean; bgColor: string; monthNum: number; monthSwitch: boolean; showToday: boolean; todayColor: string; weekText: readonly string[]; forbidDays: readonly UPCalendarDefaultDate[]; forbidDaysToast: string; monthFormat: string; pageInline: boolean; };
export type UPCalendarStripDefaults = { modelValue: UPCalendarDefaultDate | null; minDate: number; maxDate: number; color: string; weekText: readonly string[]; fullCalendar: boolean; fullCalendarProps: Record<string, never>; fullMonthNum: number; pullDownThreshold: number; collapseAfterSelect: boolean; readonly: boolean; showToday: boolean; monthFormat: string; expandHint: string; collapseHint: string; };
export type UPCanvasDefaults = { canvasAdapter?: UPCanvasAdapterComponent };
export type UPQrcodeDefaults = {
  size: number;
  unit: string;
  show: boolean;
  val: string;
  background: string;
  foreground: string;
  pdground: string;
  icon: string;
  iconSize: number;
  lv: number;
  quietZone: number;
  onval: boolean;
  loadMake: boolean;
  usingComponents: boolean;
  showLoading: boolean;
  loadingText: string;
  allowPreview: boolean;
  useRootHeightAndWidth: boolean;
};
export type UPBarcodeDefaults = {
  value: string;
  format: string;
  width: number;
  height: number;
  displayValue: boolean;
  text?: string;
  fontOptions: string;
  font: string;
  textAlign: 'left' | 'center' | 'right';
  textPosition: 'top' | 'bottom';
  textMargin: number;
  fontSize: number;
  background: string;
  lineColor: string;
  margin: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  useCanvas: boolean;
};

export type UPTreeFieldNameDefaults = {
  nodeKey: string;
  label: string;
  children: string;
  disabled: string;
};

export type UPTreeDefaults = {
  data: readonly unknown[];
  fieldNames: UPTreeFieldNameDefaults;
  nodeKey: string;
  showCheckbox: boolean;
  defaultExpandAll: boolean;
  defaultExpandedKeys: readonly (string | number)[];
  defaultCheckedKeys: readonly (string | number)[];
  expandOnClickNode: boolean;
  checkOnClickNode: boolean;
  checkStrictly: boolean;
  accordion: boolean;
  highlightCurrent: boolean;
  defaultCurrentNodeKey: string | number | null;
  indent: number;
  iconSize: number;
  checkboxSize: number;
  height: number | string;
};

export type UPWaterfallDefaults = {
  value: readonly unknown[];
  columns: number | 'auto';
  columnsMin: number;
  minColumnWidth: number | string;
  addTime: number;
  idKey: string;
  optimizeItemArrangement: boolean;
  estimatedItemSize: number | string;
  height: number | string;
};

export type UPTable2Defaults = {
  data: readonly unknown[];
  columns: readonly Record<string, unknown>[];
  rowKey: string;
  stripe: boolean;
  border: boolean;
  height: UPDimension;
  maxHeight: UPDimension;
  rowHeight: UPDimension;
  showHeader: boolean;
  fixedHeader: boolean;
  highlightCurrentRow: boolean;
  defaultCurrentRowKey: string | number | null;
  defaultSelectedRowKeys: readonly (string | number)[];
  defaultExpandedRowKeys: readonly (string | number)[];
  defaultExpandAll: boolean;
  treeProps: { children: string; hasChildren: string };
  lazy: boolean;
  sortable: boolean | 'custom';
  multiSort: boolean;
  sortOrders: readonly ('ascending' | 'descending')[];
  filters: Readonly<Record<string, unknown>>;
  showOverflowTooltip: boolean;
  emptyText: string;
  mainCol: string;
  expandWidth: UPDimension;
};

export type UPProps = {
  button: UPButtonDefaults;
  icon: UPIconDefaults;
  text: UPTextDefaults;
  tag: UPTagDefaults;
  badge: UPBadgeDefaults;
  gap: UPGapDefaults;
  line: UPLineDefaults;
  divider: UPDividerDefaults;
  section: UPSectionDefaults;
  box: UPBoxDefaults;
  cell: UPCellDefaults;
  cellGroup: UPCellGroupDefaults;
  image: UPImageDefaults;
  avatar: UPAvatarDefaults;
  card: UPCardDefaults;
  empty: UPEmptyDefaults;
  skeleton: UPSkeletonDefaults;
  row: UPRowDefaults;
  col: UPColDefaults;
  grid: UPGridDefaults;
  gridItem: UPGridItemDefaults;
  input: UPInputDefaults;
  picker: UPPickerDefaults;
  datetimePicker: UPDatetimePickerDefaults;
  cascader: UPCascaderDefaults;
  cityLocate: UPCityLocateDefaults;
  calendar: UPCalendarDefaults;
  calendarStrip: UPCalendarStripDefaults;
  textarea: UPTextareaDefaults;
  search: UPSearchDefaults;
  switch: UPSwitchDefaults;
  checkbox: UPCheckboxDefaults;
  checkboxGroup: UPCheckboxGroupDefaults;
  radio: UPRadioDefaults;
  radioGroup: UPRadioGroupDefaults;
  rate: UPRateDefaults;
  slider: UPSliderDefaults;
  numberBox: UPNumberBoxDefaults;
  codeInput: UPCodeInputDefaults;
  code: UPCodeDefaults;
  keyboard: UPKeyboardDefaults;
  numberKeyboard: UPNumberKeyboardDefaults;
  carKeyboard: UPCarKeyboardDefaults;
  tooltip: UPTooltipDefaults;
  dropdown: UPDropdownDefaults;
  dropdownItem: UPDropdownItemDefaults;
  navbar: UPNavbarDefaults;
  navbarMini: UPNavbarMiniDefaults;
  cateTab: UPCateTabDefaults;
  canvas: UPCanvasDefaults;
  qrcode: UPQrcodeDefaults;
  barcode: UPBarcodeDefaults;
  tabbar: UPTabbarDefaults;
  tabbarItem: UPTabbarItemDefaults;
  form: UPFormDefaults;
  formItem: UPFormItemDefaults;
  transition: UPTransitionDefaults;
  overlay: UPOverlayDefaults;
  popup: UPPopupDefaults;
  modal: UPModalDefaults;
  actionSheet: UPActionSheetDefaults;
  loadingIcon: UPLoadingIconDefaults;
  loadingPage: UPLoadingPageDefaults;
  toast: UPToastDefaults;
  notify: UPNotifyDefaults;
  lineProgress: UPLineProgressDefaults;
  circleProgress: UPCircleProgressDefaults;
  loadmore: UPLoadmoreDefaults;
  pullRefresh: UPPullRefreshDefaults;
  countDown: UPCountDownDefaults;
  countTo: UPCountToDefaults;
  statusBar: UPStatusBarDefaults;
  safeBottom: UPSafeBottomDefaults;
  noticeBar: UPNoticeBarDefaults;
  columnNotice: UPColumnNoticeDefaults;
  rowNotice: UPRowNoticeDefaults;
  swipeAction: UPSwipeActionDefaults;
  swipeActionItem: UPSwipeActionItemDefaults;
  readMore: UPReadMoreDefaults;
  sticky: UPStickyDefaults;
  backtop: UPBackTopDefaults;
  link: UPLinkDefaults;
  alert: UPAlertDefaults;
  avatarGroup: UPAvatarGroupDefaults;
  album: UPAlbumDefaults;
  upload: UPUploadDefaults;
  lazyLoad: UPLazyLoadDefaults;
  tree: UPTreeDefaults;
  waterfall: UPWaterfallDefaults;
  table2: UPTable2Defaults;
  indexList: UPIndexListDefaults;
  indexAnchor: UPIndexAnchorDefaults;
  subsection: UPSubsectionDefaults;
  collapse: UPCollapseDefaults;
  collapseItem: UPCollapseItemDefaults;
  steps: UPStepsDefaults;
  stepsItem: UPStepsItemDefaults;
  toolbar: UPToolbarDefaults;
  scrollList: UPScrollListDefaults;
  tabs: UPTabsDefaults;
  pagination: UPPaginationDefaults;
  table: UPTableDefaults;
  swiper: UPSwiperDefaults;
  swiperIndicator: UPSwiperIndicatorDefaults;
  list: UPListDefaults;
  listItem: UPListItemDefaults;
  virtualList: UPVirtualListDefaults;
  refreshVirtualList: UPRefreshVirtualListDefaults;
  dragsort: UPDragsortDefaults;
  signature: UPSignatureDefaults;
  guide: UPGuideDefaults;
  agreement: UPAgreementDefaults;
  noNetwork: UPNoNetworkDefaults;
  floatButton: UPFloatButtonDefaults;
  copy: UPCopyDefaults;
  choose: UPChooseDefaults;
};

export const sourceDefaults: Readonly<{
  config: {
    version: string;
    unit: 'px';
    iconUrl: string;
  };
  color: typeof sourceLightColors;
  zIndex: typeof sourceZIndex;
  props: UPProps;
}> = Object.freeze({
  config: Object.freeze({
    version: '3',
    unit: 'px' as const,
    iconUrl: 'https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf',
  }),
  color: sourceLightColors,
  zIndex: sourceZIndex,
  props: Object.freeze({
    button: Object.freeze({
      hairline: false,
      type: 'info' as const,
      size: 'normal' as const,
      shape: 'square' as const,
      plain: false,
      disabled: false,
      loading: false,
      loadingText: '',
      loadingMode: 'spinner',
      loadingSize: 15,
      openType: '',
      formType: '',
      appParameter: '',
      hoverStopPropagation: true,
      lang: 'en',
      sessionFrom: '',
      sendMessageTitle: '',
      sendMessagePath: '',
      sendMessageImg: '',
      showMessageCard: false,
      dataName: '',
      throttleTime: 0,
      hoverStartTime: 0,
      hoverStayTime: 200,
      text: '',
      icon: '',
      iconColor: '',
      color: '',
      stop: true,
    }),
    icon: Object.freeze({
      name: '',
      color: sourceLightColors.contentColor,
      size: '16px',
      bold: false,
      index: '',
      hoverClass: '',
      customPrefix: 'uicon',
      label: '',
      labelPos: 'right' as const,
      labelSize: '15px',
      labelColor: sourceLightColors.contentColor,
      space: '3px',
      imgMode: '',
      width: '',
      height: '',
      top: 0,
      stop: false,
    }),
    text: Object.freeze({
      type: '' as const,
      show: true,
      text: '',
      prefixIcon: '',
      suffixIcon: '',
      mode: '',
      href: '',
      format: '',
      call: false,
      openType: '',
      bold: false,
      block: false,
      lines: '',
      color: '',
      size: 15,
      iconStyle: Object.freeze({ fontSize: '15px' }),
      decoration: 'none' as const,
      margin: 0,
      lineHeight: '',
      align: 'left' as const,
      wordWrap: 'normal' as const,
      flex1: true,
    }),
    tag: Object.freeze({
      type: 'primary' as const,
      disabled: false,
      size: 'medium' as const,
      shape: 'square' as const,
      text: '',
      bgColor: '',
      color: '',
      borderColor: '',
      closeColor: '#C6C7CB',
      name: '',
      plainFill: false,
      plain: false,
      closable: false,
      show: true,
      icon: '',
      iconColor: '',
      textSize: '',
      height: '',
      padding: '',
      borderRadius: '',
      autoBgColor: 0,
    }),
    badge: Object.freeze({
      isDot: false,
      value: '',
      show: true,
      max: 999,
      type: 'error' as const,
      showZero: false,
      bgColor: null,
      color: null,
      shape: 'circle' as const,
      numberType: 'overflow' as const,
      offset: Object.freeze([]) as unknown as string[],
      inverted: false,
      absolute: false,
    }),
    gap: Object.freeze({
      bgColor: 'transparent',
      height: 20,
      marginTop: 0,
      marginBottom: 0,
    }),
    line: Object.freeze({
      color: '#d6d7d9',
      length: '100%',
      direction: 'row' as const,
      hairline: true,
      margin: 0,
      dashed: false,
    }),
    divider: Object.freeze({
      dashed: false,
      hairline: true,
      dot: false,
      textPosition: 'center' as const,
      text: '',
      textSize: 14,
      textColor: '#909399',
      lineColor: '#dcdfe6',
    }),
    section: Object.freeze({
      title: '',
      subTitle: '更多',
      right: true,
      fontSize: 15,
      bold: true,
      color: '#303133',
      subColor: '#909399',
      showLine: true,
      lineColor: '',
      arrow: true,
    }),
    box: Object.freeze({
      bgColors: Object.freeze(['#EEFCFF', '#FCF8FF', '#FDF8F2']) as unknown as [
        string,
        string,
        string,
      ],
      height: '160px',
      borderRadius: '6px',
      gap: '15px',
      leftIcon: '',
      leftTitle: '左',
      rightTopIcon: '',
      rightTopTitle: '右上',
      rightBottomIcon: '',
      rightBottomTitle: '右下',
    }),
    cell: Object.freeze({
      customClass: '',
      title: '',
      label: '',
      value: '',
      icon: '',
      disabled: false,
      border: true,
      center: false,
      url: '',
      linkType: 'navigateTo',
      clickable: false,
      isLink: false,
      required: false,
      arrowDirection: '',
      iconStyle: Object.freeze({}),
      rightIconStyle: Object.freeze({}),
      rightIcon: 'arrow-right',
      titleStyle: Object.freeze({}),
      size: '',
      stop: true,
      name: '',
    }),
    cellGroup: Object.freeze({
      title: '',
      border: true,
    }),
    image: Object.freeze({
      src: '',
      mode: 'aspectFill',
      width: '300',
      height: '225',
      shape: 'square' as const,
      radius: 0,
      lazyLoad: true,
      showMenuByLongpress: true,
      loadingIcon: 'photo',
      errorIcon: 'error-circle',
      showLoading: true,
      showError: true,
      fade: true,
      webp: false,
      duration: 500,
      bgColor: '#f3f4f6',
    }),
    avatar: Object.freeze({
      src: '',
      shape: 'circle' as const,
      size: 40,
      mode: 'scaleToFill',
      text: '',
      bgColor: '#c0c4cc',
      color: '#ffffff',
      fontSize: 18,
      icon: '',
      mpAvatar: false,
      randomBgColor: false,
      defaultUrl: '',
      colorIndex: '',
      name: '',
    }),
    card: Object.freeze({
      full: false,
      title: '',
      titleColor: '#303133',
      titleSize: '15px',
      subTitle: '',
      subTitleColor: '#909399',
      subTitleSize: '13px',
      border: true,
      index: '',
      margin: '15px',
      borderRadius: '8px',
      headStyle: Object.freeze({}),
      bodyStyle: Object.freeze({}),
      footStyle: Object.freeze({}),
      headBorderBottom: true,
      footBorderTop: true,
      thumb: '',
      thumbWidth: '30px',
      thumbCircle: false,
      padding: '15px',
      paddingHead: '',
      paddingBody: '',
      paddingFoot: '',
      showHead: true,
      showFoot: true,
      boxShadow: 'none',
    }),
    empty: Object.freeze({
      icon: '',
      text: '',
      textColor: '#c0c4cc',
      textSize: 14,
      iconColor: '#c0c4cc',
      iconSize: 90,
      mode: 'data',
      width: 160,
      height: 160,
      show: true,
      marginTop: 0,
    }),
    skeleton: Object.freeze({
      loading: true,
      animate: true,
      rows: 0,
      rowsWidth: '100%',
      rowsHeight: 18,
      title: true,
      titleWidth: '50%',
      titleHeight: 18,
      avatar: false,
      avatarSize: 32,
      avatarShape: 'circle' as const,
    }),
    row: Object.freeze({
      gutter: 0,
      justify: 'start',
      align: 'center',
    }),
    col: Object.freeze({
      span: 12,
      offset: 0,
      justify: 'start',
      align: 'stretch',
      textAlign: 'left',
    }),
    grid: Object.freeze({
      col: 3,
      border: false,
      align: 'left',
    }),
    gridItem: Object.freeze({
      name: null,
      bgColor: 'transparent',
    }),
    input: Object.freeze({
      value: '', type: 'text', fixed: false, disabled: false, disabledColor: '', clearable: false,
      password: false, maxlength: 140, placeholder: null, placeholderClass: 'input-placeholder',
      placeholderStyle: '', showWordLimit: false, confirmType: 'done', confirmHold: false,
      holdKeyboard: false, focus: false, autoBlur: false, disableDefaultPadding: false,
      cursor: -1, cursorSpacing: 30, selectionStart: -1, selectionEnd: -1, adjustPosition: true,
      inputAlign: 'left' as const, fontSize: '15px', color: '', prefixIcon: '', prefixIconStyle: '',
      suffixIcon: '', suffixIconStyle: '', border: 'surround' as const, readonly: false,
      shape: 'square' as const, cursorColor: '#53c21d', passwordVisibilityToggle: true,
    }),
    picker: Object.freeze({
      show: false,
      popupMode: 'bottom' as const,
      showToolbar: true,
      title: '',
      columns: Object.freeze([]) as readonly (readonly unknown[])[],
      loading: false,
      itemHeight: 44,
      cancelText: '取消',
      confirmText: '确认',
      cancelColor: '#909193',
      confirmColor: '',
      visibleItemCount: 5,
      keyName: 'text',
      valueName: 'value',
      closeOnClickOverlay: false,
      defaultIndex: Object.freeze([]) as readonly number[],
      immediateChange: true,
      zIndex: 10076,
      disabled: false,
      disabledColor: '',
      placeholder: '请选择',
      inputProps: Object.freeze({}),
      bgColor: '',
      round: 0,
      duration: 300,
      overlayOpacity: 0.5,
      pageInline: false,
    }),
    datetimePicker: Object.freeze({
      show: false,
      popupMode: 'bottom' as const,
      showToolbar: true,
      title: '',
      mode: 'datetime' as const,
      minDate: datetimePickerMinDate,
      maxDate: datetimePickerMaxDate,
      minHour: 0,
      maxHour: 23,
      minMinute: 0,
      maxMinute: 59,
      minSecond: 0,
      maxSecond: 59,
      filter: null,
      formatter: null,
      loading: false,
      itemHeight: 44,
      cancelText: '取消',
      confirmText: '确认',
      cancelColor: '#909193',
      confirmColor: '#3c9cff',
      visibleItemCount: 5,
      closeOnClickOverlay: false,
      defaultIndex: Object.freeze([]) as readonly number[],
      zIndex: 10076,
      disabled: false,
      disabledColor: '',
      placeholder: '请选择',
      inputProps: Object.freeze({}),
      bgColor: '',
      round: 0,
      duration: 300,
      overlayOpacity: 0.5,
      pageInline: false,
    }),
    cascader: Object.freeze({
      show: false,
      data: Object.freeze([]) as readonly Record<string, unknown>[],
      modelValue: Object.freeze([]) as readonly (string | number | boolean | null)[],
      valueKey: 'value',
      labelKey: 'label',
      childrenKey: 'children',
      maskCloseAble: true,
      zIndex: 0,
      autoClose: false,
      headerDirection: 'row' as const,
      optionsCols: 2 as const,
      closeable: true,
    }),
    cityLocate: Object.freeze({
      indexList: Object.freeze(['🔥']),
      cityList: Object.freeze([
        Object.freeze([
          Object.freeze({ name: '北京', value: 'beijing' }),
          Object.freeze({ name: '上海', value: 'shanghai' }),
          Object.freeze({ name: '广州', value: 'guangzhou' }),
          Object.freeze({ name: '深圳', value: 'shenzhen' }),
          Object.freeze({ name: '杭州', value: 'hangzhou' }),
        ]),
      ]),
      locationType: 'wgs84',
      currentCity: '',
      nameKey: 'name',
    }),
    calendar: Object.freeze({
      title: '日期选择', showTitle: true, showSubtitle: true, mode: 'single' as const, startText: '开始', endText: '结束',
      customList: Object.freeze([]) as readonly Record<string, unknown>[], color: '#3c9cff', minDate: 0, maxDate: 0,
      defaultDate: null, maxCount: Number.MAX_SAFE_INTEGER, rowHeight: 56, formatter: null, showLunar: false, showMark: true,
      confirmText: '确认', confirmDisabledText: '确认', show: false, closeOnClickOverlay: false, readonly: false, showConfirm: true,
      maxRange: Number.MAX_SAFE_INTEGER, rangePrompt: '', showRangePrompt: true, allowSameDay: false, rangeResultMode: 'all' as const,
      enableTime: false, timePrecision: 'minute' as const, defaultTime: '', round: 0, overlay: true, duration: 300,
      overlayStyle: Object.freeze({}), overlayOpacity: 0.5, zIndex: 10075, safeAreaInsetBottom: true, safeAreaInsetTop: false,
      bgColor: '', monthNum: 3, monthSwitch: false, showToday: true, todayColor: '',
      weekText: Object.freeze(['一', '二', '三', '四', '五', '六', '日']), forbidDays: Object.freeze([]), forbidDaysToast: '此日期不可选',
      monthFormat: '', pageInline: false,
    }),
    calendarStrip: Object.freeze({
      modelValue: null, minDate: 0, maxDate: 0, color: '#3c9cff', weekText: Object.freeze(['一', '二', '三', '四', '五', '六', '日']),
      fullCalendar: true, fullCalendarProps: Object.freeze({}), fullMonthNum: 24, pullDownThreshold: 40, collapseAfterSelect: true,
      readonly: false, showToday: true, monthFormat: '', expandHint: '下拉展开月历', collapseHint: '上拉收起月历',
    }),
    textarea: Object.freeze({
      value: '', placeholder: '', placeholderClass: 'textarea-placeholder', placeholderStyle: '',
      height: 70, confirmType: 'done', disabled: false, count: false, focus: false, autoHeight: false,
      fixed: false, cursorSpacing: 0, cursor: '', showConfirmBar: true, selectionStart: -1,
      selectionEnd: -1, adjustPosition: true, disableDefaultPadding: false, holdKeyboard: false,
      maxlength: 140, border: 'surround' as const,
    }),
    search: Object.freeze({
      shape: 'round' as const, bgColor: '', placeholder: '请输入关键字', clearabled: true,
      focus: false, showAction: true, actionText: '搜索', inputAlign: 'left' as const,
      disabled: false, borderColor: 'transparent', searchIconColor: '#909399', searchIconSize: 22,
      color: '', placeholderColor: '', searchIcon: 'search', iconPosition: 'left' as const,
      margin: '0', animation: false, value: '', maxlength: '-1', height: 32, label: null,
      adjustPosition: true, autoBlur: true,
    }),
    switch: Object.freeze({ loading: false, disabled: false, size: 25, activeColor: '#2979ff', inactiveColor: '#ffffff', dotActiveColor: '#ffffff', dotInactiveColor: '#ffffff', value: false, activeValue: true, inactiveValue: false, asyncChange: false, space: 0 }),
    checkbox: Object.freeze({ name: '', shape: '', size: '', checked: false, disabled: '', activeColor: '', inactiveColor: '', iconSize: '', iconColor: '', label: '', labelSize: '', labelColor: '', labelDisabled: '' }),
    checkboxGroup: Object.freeze({ name: '', value: Object.freeze([]), shape: 'square' as const, disabled: false, activeColor: '#2979ff', inactiveColor: '#c8c9cc', size: 18, placement: 'row' as const, labelSize: 14, labelColor: '#303133', labelDisabled: false, iconColor: '#ffffff', iconSize: 12, iconPlacement: 'left' as const, borderBottom: false }),
    radio: Object.freeze({ name: '', shape: '', disabled: '', labelDisabled: '', activeColor: '', inactiveColor: '', iconSize: '', labelSize: '', label: '', labelColor: '', size: '', iconColor: '', placement: '' }),
    radioGroup: Object.freeze({ value: '', disabled: false, shape: 'circle' as const, activeColor: '#2979ff', inactiveColor: '#c8c9cc', name: '', size: 18, placement: 'row' as const, label: '', labelColor: '#303133', labelSize: 14, labelDisabled: false, iconColor: '#ffffff', iconSize: 12, borderBottom: false, iconPlacement: 'left' as const, gap: '10px' }),
    rate: Object.freeze({ value: 1, count: 5, disabled: false, size: 18, inactiveColor: '', activeColor: '', gutter: 4, minCount: 1, allowHalf: false, activeIcon: 'star-fill', inactiveIcon: 'star', touchable: true }),
    slider: Object.freeze({ value: 0, blockSize: 18, min: 0, max: 100, step: 1, activeColor: '#2979ff', inactiveColor: '#c0c4cc', blockColor: '#ffffff', showValue: false, disabled: false, useNative: false, height: '', size: '2px', length: 'auto', vertical: false }),
    numberBox: Object.freeze({ name: '', value: 0, min: 1, max: Number.MAX_SAFE_INTEGER, step: 1, integer: false, disabled: false, disabledInput: false, asyncChange: false, inputWidth: 35, showMinus: true, showPlus: true, decimalLength: null, longPress: true, color: '', buttonWidth: 30, buttonSize: 30, buttonRadius: '0px', bgColor: '', disabledBgColor: '', inputBgColor: '', cursorSpacing: 100, disableMinus: false, disablePlus: false, iconStyle: '', miniMode: false }),
    codeInput: Object.freeze({ adjustPosition: true, maxlength: 6, dot: false, mode: 'box' as const, hairline: false, space: 10, value: '', focus: false, bold: false, color: '#606266', fontSize: 18, size: 35, disabledKeyboard: false, borderColor: '#c9cacc', disabledDot: true }),
    code: Object.freeze({ seconds: 60, startText: '获取验证码', changeText: 'X秒重新获取', endText: '重新获取', keepRunning: false, uniqueKey: '' }),
    keyboard: Object.freeze({ mode: 'number' as const, dotDisabled: false, tooltip: true, showTips: true, tips: '', showCancel: true, showConfirm: true, random: false, safeAreaInsetBottom: true, closeOnClickOverlay: true, show: false, overlay: true, zIndex: 10075, cancelText: '取消', confirmText: '确认', autoChange: false }),
    numberKeyboard: Object.freeze({ mode: 'number' as const, dotDisabled: false, random: false }),
    carKeyboard: Object.freeze({ random: false }),
    tooltip: Object.freeze({ text: '', copyText: '', size: 14, color: '#606266', bgColor: 'transparent', popupBgColor: '', direction: 'top' as const, zIndex: 10071, showCopy: true, buttons: Object.freeze([]) as readonly (string | number)[], overlay: true, showToast: true, triggerMode: 'longpress' as const, forcePosition: Object.freeze({}), show: false, singleton: false }),
    dropdown: Object.freeze({ activeColor: '#2979ff', inactiveColor: '#606266', closeOnClickMask: true, closeOnClickSelf: true, duration: 300, height: 40, borderBottom: false, titleSize: 14, borderRadius: 0, menuIcon: 'arrow-down', menuIconSize: 14 }),
    dropdownItem: Object.freeze({ modelValue: '', title: '', options: Object.freeze([]), disabled: false, height: 'auto', closeOnClickOverlay: true }),
    navbar: Object.freeze({ safeAreaInsetTop: true, placeholder: false, fixed: false, border: false, leftIcon: 'arrow-left', leftText: '', rightText: '', rightIcon: '', title: '', titleColor: '', bgColor: '#ffffff', statusBarBgColor: '', titleWidth: '400rpx', height: '44px', leftIconSize: '20px', leftIconColor: '#303133', autoBack: false, titleStyle: Object.freeze({}) }),
    navbarMini: Object.freeze({ safeAreaInsetTop: true, placeholder: false, fixed: true, leftIcon: 'arrow-leftward', bgColor: 'rgba(0,0,0,.15)', height: '32px', iconSize: '20px', iconColor: '#fff', leftIconColor: '', autoBack: true, homeUrl: '' }),
    cateTab: Object.freeze({ mode: 'follow' as const, height: '100%', tabList: Object.freeze([]) as readonly Record<string, unknown>[], tabKeyName: 'name', itemKeyName: 'name', current: 0, animated: true }),
    canvas: Object.freeze({ canvasAdapter: undefined }),
    qrcode: Object.freeze({
      allowPreview: false,
      background: '#ffffff',
      foreground: '#000000',
      icon: '',
      iconSize: 40,
      loadMake: true,
      loadingText: '生成中',
      lv: 3,
      onval: true,
      pdground: '#000000',
      quietZone: 0,
      show: true,
      showLoading: true,
      size: 200,
      unit: 'px',
      useRootHeightAndWidth: false,
      usingComponents: true,
      val: '',
    }),
    barcode: Object.freeze({
      background: '#ffffff',
      displayValue: true,
      font: 'monospace',
      fontOptions: '',
      fontSize: 14,
      format: 'auto',
      height: 80,
      lineColor: '#000000',
      margin: 10,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      marginTop: undefined,
      text: undefined,
      textAlign: 'center' as const,
      textMargin: 2,
      textPosition: 'bottom' as const,
      useCanvas: true,
      value: '',
      width: 200,
    }),
    tabbar: Object.freeze({ value: null, safeAreaInsetBottom: true, border: true, borderColor: '', zIndex: 1, activeColor: '#1989fa', inactiveColor: '#7d7e80', fixed: true, placeholder: true, backgroundColor: '', styleType: 'default', animationType: 'none', activeBackgroundColor: '', inactiveBackgroundColor: '', itemShape: 'default', iconScale: 1.1, textMode: 'always' }),
    tabbarItem: Object.freeze({ name: null, icon: '', activeIcon: '', inactiveIcon: '', badge: null, dot: false, text: '', badgeStyle: 'top: 6px;right:2px;', mode: '', activeClass: '', inactiveClass: '', midButtonBgColor: '', midButtonIconColor: '', midButtonIconSize: 26, midButtonBoxShadow: '', midButtonInnerBoxShadow: '', midButtonOffsetY: -10 }),
    form: Object.freeze({ model: Object.freeze({}), rules: Object.freeze({}), errorType: 'message' as const, borderBottom: true, labelPosition: 'left' as const, labelWidth: 45, labelAlign: 'left' as const, labelStyle: Object.freeze({}) }),
    formItem: Object.freeze({ label: '', prop: '', rules: Object.freeze([]), borderBottom: '' as const, labelPosition: '' as const, labelWidth: '' as const, rightIcon: '', leftIcon: '', required: false, leftIconStyle: '' }),
    transition: Object.freeze({ show: false, mode: 'fade' as const, duration: '300', timingFunction: 'ease-out' }),
    overlay: Object.freeze({ show: false, zIndex: 10070, duration: 300, opacity: 0.5 }),
    popup: Object.freeze({ show: false, overlay: true, mode: 'bottom' as const, duration: 300, closeable: false, overlayStyle: Object.freeze({}), closeOnClickOverlay: true, zIndex: 10075, safeAreaInsetBottom: true, safeAreaInsetTop: false, closeIconPos: 'top-right' as const, round: '20px', zoom: true, bgColor: '', overlayOpacity: 0.5, pageInline: false, touchable: false, minHeight: '200px', maxHeight: '600px' }),
    modal: Object.freeze({ show: false, title: '', content: '', confirmText: '确认', cancelText: '取消', showConfirmButton: true, showCancelButton: false, confirmColor: '#2979ff', cancelColor: '#606266', buttonReverse: false, zoom: true, asyncClose: false, closeOnClickOverlay: false, negativeTop: 0, width: '650rpx', confirmButtonShape: '', duration: 400, contentTextAlign: 'left' as const, asyncCloseTip: '操作中...', asyncCancelClose: false, contentStyle: Object.freeze({}) }),
    actionSheet: Object.freeze({ show: false, title: '', description: '', actions: Object.freeze([]), nameKey: 'name', subnameKey: 'subnameKey', index: '', cancelText: '', closeOnClickAction: true, safeAreaInsetBottom: true, openType: '', closeOnClickOverlay: true, round: 0, wrapMaxHeight: '600px' }),
    loadingIcon: Object.freeze({ show: true, color: '#909399', textColor: '#909399', vertical: false, mode: 'spinner' as const, size: 24, textSize: 15, text: '', timingFunction: 'ease-in-out', duration: 1200, inactiveColor: '' }),
    loadingPage: Object.freeze({ loadingText: '加载中...', image: '', loadingMode: 'circle' as const, loading: false, bgColor: '', color: '#C8C8C8', fontSize: 19, iconSize: 28, loadingColor: '#C8C8C8', zIndex: 10 }),
    toast: Object.freeze({ zIndex: 10090, loading: false, message: '', icon: '', type: '', loadingMode: '', show: false, overlay: false, position: 'center' as const, params: Object.freeze({}), duration: 2000, isTab: false, url: '', back: false }),
    notify: Object.freeze({ top: 0, type: 'primary' as const, color: '#ffffff', bgColor: '', message: '', duration: 3000, fontSize: 15, safeAreaInsetTop: false }),
    lineProgress: Object.freeze({ activeColor: '#19be6b', inactiveColor: '#ececec', percentage: 0, showText: true, height: 12, fromRight: false }),
    circleProgress: Object.freeze({ percentage: 30 }),
    loadmore: Object.freeze({ status: 'loadmore' as const, bgColor: 'transparent', icon: true, fontSize: 14, iconSize: 17, color: '#606266', loadingIcon: 'spinner' as const, loadmoreText: '加载更多', loadingText: '加载中...', nomoreText: '没有更多了', isDot: false, iconColor: '#b7b7b7', marginTop: 10, marginBottom: 10, height: 'auto', line: false, lineColor: '#E6E8EB', dashed: false }),
    pullRefresh: Object.freeze({ damping: 0.4, enableBackToTop: false, height: '100%', loadmoreProps: Object.freeze({ status: 'loadmore' as const }), lowerThreshold: 50, maxDistance: 120, refreshing: false, scrollTop: 0, showLoadmore: false, threshold: 80, useScrollView: true }),
    countDown: Object.freeze({ time: 0, format: 'HH:mm:ss', autoStart: true, millisecond: false }),
    countTo: Object.freeze({ startVal: 0, endVal: 0, duration: 2000, autoplay: true, decimals: 0, useEasing: true, decimal: '.', color: '#606266', fontSize: 22, bold: false, separator: '' }),
    statusBar: Object.freeze({ bgColor: 'transparent', height: 0 }),
    safeBottom: Object.freeze({}),
    noticeBar: Object.freeze({ text: Object.freeze([]) as readonly string[], direction: 'row', step: false, icon: 'volume', mode: '', color: '#f9ae3d', bgColor: '#fdf6ec', speed: 80, fontSize: 14, duration: 2000, disableTouch: true, url: '', linkType: 'navigateTo', justifyContent: 'flex-start' }),
    columnNotice: Object.freeze({ text: Object.freeze([]) as readonly string[], icon: 'volume', mode: '', color: '#f9ae3d', bgColor: '#fdf6ec', fontSize: 14, speed: 80, step: false, duration: 1500, disableTouch: true, justifyContent: 'flex-start' }),
    rowNotice: Object.freeze({ text: '', icon: 'volume', mode: '', color: '#f9ae3d', bgColor: '#fdf6ec', fontSize: 14, speed: 80 }),
    swipeAction: Object.freeze({ autoClose: true }),
    swipeActionItem: Object.freeze({ show: false, closeOnClick: true, name: '', disabled: false, autoClose: true, threshold: 20, options: Object.freeze([]) as readonly unknown[], duration: 300 }),
    readMore: Object.freeze({ showHeight: 400, toggle: false, closeText: '展开阅读全文', openText: '收起', color: '#2979ff', fontSize: 14, textIndent: '2em', name: '' }),
    sticky: Object.freeze({ offsetTop: 0, customNavHeight: 0, disabled: false, bgColor: 'transparent', zIndex: '', index: '' }),
    backtop: Object.freeze({ mode: 'circle', icon: 'arrow-upward', text: '', duration: 100, scrollTop: 0, top: 400, bottom: 100, right: 20, zIndex: 9, iconStyle: Object.freeze({ color: '#909399', fontSize: '19px' }) }),
    link: Object.freeze({ color: '#3c9cff', fontSize: 15, underLine: false, href: '', mpTips: '链接已复制，请在浏览器打开', lineColor: '', text: '' }),
    alert: Object.freeze({ title: '', type: 'warning' as const, description: '', closable: false, showIcon: false, effect: 'light' as const, center: false, fontSize: 14, transitionMode: 'fade', duration: 0, icon: '', value: true }),
    avatarGroup: Object.freeze({ urls: Object.freeze([]) as readonly unknown[], maxCount: 5, shape: 'circle' as const, mode: 'scaleToFill', showMore: true, size: 40, keyName: '', gap: 0.5, extraValue: 0 }),
    album: Object.freeze({ urls: Object.freeze([]) as readonly unknown[], keyName: '', singleSize: 180, multipleSize: 70, space: 6, singleMode: 'scaleToFill', multipleMode: 'aspectFill', maxCount: 9, previewFullImage: true, rowCount: 3, showMore: true, autoWrap: false, unit: 'px', stop: true }),
    upload: Object.freeze({ accept: 'image' as const, autoUpload: true, capture: false as const, deletable: true, disabled: false, fileList: Object.freeze([]) as readonly unknown[], formData: Object.freeze({}) as Record<string, unknown>, header: Object.freeze({}) as Record<string, string>, maxCount: 9, maxSize: Number.POSITIVE_INFINITY, multiple: false, name: 'file', previewImage: true, uploadText: '上传图片', url: '' }),
    lazyLoad: Object.freeze({ height: 100, mode: 'aspectFill', once: true, threshold: 0, width: 100 }),
    tree: Object.freeze({
      accordion: false,
      checkOnClickNode: false,
      checkStrictly: false,
      checkboxSize: 16,
      data: Object.freeze([]) as readonly unknown[],
      defaultCheckedKeys: Object.freeze([]) as readonly (string | number)[],
      defaultCurrentNodeKey: null,
      defaultExpandAll: false,
      defaultExpandedKeys: Object.freeze([]) as readonly (string | number)[],
      expandOnClickNode: false,
      fieldNames: Object.freeze({
        children: 'children',
        disabled: 'disabled',
        label: 'label',
        nodeKey: 'id',
      }),
      height: '100%',
      highlightCurrent: false,
      iconSize: 14,
      indent: 32,
      nodeKey: '',
      showCheckbox: false,
    }),
    waterfall: Object.freeze({
      addTime: 200,
      columns: 2 as const,
      columnsMin: 2,
      estimatedItemSize: 160,
      height: '100%',
      idKey: 'id',
      minColumnWidth: 230,
      optimizeItemArrangement: false,
      value: Object.freeze([]) as readonly unknown[],
    }),
    table2: Object.freeze({
      border: false,
      columns: Object.freeze([]) as readonly Record<string, unknown>[],
      data: Object.freeze([]) as readonly unknown[],
      defaultCurrentRowKey: null,
      defaultExpandAll: false,
      defaultExpandedRowKeys: Object.freeze([]) as readonly (string | number)[],
      defaultSelectedRowKeys: Object.freeze([]) as readonly (string | number)[],
      emptyText: '暂无数据',
      expandWidth: 25,
      filters: Object.freeze({}) as Readonly<Record<string, unknown>>,
      fixedHeader: true,
      height: 'auto',
      highlightCurrentRow: false,
      lazy: false,
      mainCol: '',
      maxHeight: 'auto',
      multiSort: false,
      rowHeight: 36,
      rowKey: 'id',
      showHeader: true,
      showOverflowTooltip: false,
      sortOrders: Object.freeze(['ascending', 'descending']) as readonly ('ascending' | 'descending')[],
      sortable: false,
      stripe: false,
      treeProps: Object.freeze({ children: 'children', hasChildren: 'hasChildren' }),
    }),
    indexList: Object.freeze({ inactiveColor: '#606266', activeColor: '#5677fc', indexList: Object.freeze([]) as readonly unknown[], sticky: true, customNavHeight: 0, safeBottomFix: false, itemMargin: '0rpx' }),
    indexAnchor: Object.freeze({ text: '', color: '#606266', size: 14, bgColor: '#f1f1f1', height: 32 }),
    subsection: Object.freeze({ list: Object.freeze([]) as readonly unknown[], current: 0, activeColor: '#3c9cff', inactiveColor: '#303133', mode: 'button' as const, fontSize: 12, bold: true, bgColor: '#eeeeef', keyName: 'name', activeColorKeyName: 'activeColorKey', inactiveColorKeyName: 'inactiveColorKey', disabled: false }),
    collapse: Object.freeze({ value: null, accordion: false, border: true }),
    collapseItem: Object.freeze({ title: '', value: '', label: '', disabled: false, isLink: true, clickable: true, border: true, align: 'left' as const, name: '', icon: '', duration: 300, showRight: true, titleStyle: Object.freeze({}), iconStyle: Object.freeze({}), rightIconStyle: Object.freeze({}), cellCustomStyle: Object.freeze({}), cellCustomClass: '' }),
    steps: Object.freeze({ direction: 'row' as const, current: 0, activeColor: '#3c9cff', inactiveColor: '#969799', activeIcon: '', inactiveIcon: '', dot: false }),
    stepsItem: Object.freeze({ title: '', desc: '', iconSize: 17, error: false }),
    toolbar: Object.freeze({ show: true, cancelText: '取消', confirmText: '确认', cancelColor: '#909193', confirmColor: '', title: '', rightSlot: false }),
    scrollList: Object.freeze({ indicatorWidth: 50, indicatorBarWidth: 20, indicator: true, indicatorColor: '#f2f2f2', indicatorActiveColor: '#3c9cff', indicatorStyle: Object.freeze({}) }),
    tabs: Object.freeze({ duration: 300, list: Object.freeze([]) as readonly Record<string, unknown>[], lineColor: '', activeStyle: Object.freeze({ color: '#303133' }), inactiveStyle: Object.freeze({ color: '#606266' }), lineWidth: 20, lineHeight: 3, lineBgSize: 'cover', itemStyle: Object.freeze({ height: '44px' }), scrollable: true, current: 0, keyName: 'name', iconStyle: Object.freeze({}), shapeMode: '' }),
    pagination: Object.freeze({ currentPage: 1, pageSize: 10, total: 0, prevText: '', nextText: '', buttonBgColor: '#f5f7fa', buttonBorderColor: '#dcdfe6', pageSizes: Object.freeze([10, 20, 30, 40, 50]) as readonly UPPaginationDefaultSize[], layout: 'prev, pager, next', hideOnSinglePage: false }),
    table: Object.freeze({ borderColor: '#e4e7ed', align: 'center' as const, padding: '5px 3px', fontSize: '14px', color: '#606266', thStyle: Object.freeze({}), bgColor: '#ffffff' }),
    swiper: Object.freeze({ list: Object.freeze([]) as readonly unknown[], indicator: false, indicatorActiveColor: '#FFFFFF', indicatorInactiveColor: 'rgba(255, 255, 255, 0.35)', indicatorStyle: Object.freeze({}), indicatorMode: 'line' as const, autoplay: true, current: 0, currentItemId: '', interval: 3000, duration: 300, circular: false, vertical: false, previousMargin: 0, nextMargin: 0, acceleration: false, displayMultipleItems: 1, easingFunction: 'default', keyName: 'url', imgMode: 'aspectFill', height: 130, bgColor: '#f3f4f6', radius: 4, loading: false, showTitle: false }),
    swiperIndicator: Object.freeze({ length: 0, current: 0, indicatorActiveColor: '', indicatorInactiveColor: '', indicatorMode: 'line' as const }),
    list: Object.freeze({ showScrollbar: false, lowerThreshold: 50, upperThreshold: 0, scrollTop: 0, offsetAccuracy: 10, enableFlex: false, pagingEnabled: false, scrollable: true, scrollIntoView: '', scrollWithAnimation: false, enableBackToTop: false, height: 0, width: 0, preLoadScreen: 1, refresherEnabled: false, refresherThreshold: 45, refresherDefaultStyle: 'black', refresherBackground: '#FFFFFF', refresherTriggered: false }),
    listItem: Object.freeze({ anchor: '' }),
    virtualList: Object.freeze({ buffer: 4, height: '100%', itemHeight: 50, keyField: 'id', listData: Object.freeze([]) as readonly unknown[], scrollTop: 0 }),
    refreshVirtualList: Object.freeze({ buffer: 4, height: '100%', itemHeight: 50, keyField: 'id', listData: Object.freeze([]) as readonly unknown[], refreshing: false, scrollTop: 0, threshold: 50 }),
    dragsort: Object.freeze({ columns: 3, direction: 'vertical' as const, draggable: true, initialList: Object.freeze([]) as readonly unknown[], itemHeight: 50, itemWidth: 100, vibrate: true }),
    signature: Object.freeze({ bgColor: '#ffffff', color: '#000000', height: 180, presetColors: Object.freeze(['#000000', '#2979ff', '#19be6b', '#f56c6c']) as readonly string[], showToolbar: true, thickness: 3, width: 300 }),
    guide: Object.freeze({ bgColor: '#111111', finishText: '立即体验', indicator: true, list: Object.freeze([]) as readonly UPGuideDefaultPage[], nextText: '下一步', once: true, show: false, showSkip: true, skipText: '跳过', storageKey: 'up-guide-default', zIndex: 10075 }),
    agreement: Object.freeze({ urlProtocol: '/pages/user_agreement/agreement/info?title=用户协议', urlPrivacy: '/pages/user_agreement/agreement/info?title=隐私政策' }),
    noNetwork: Object.freeze({ tips: '哎呀，网络信号丢失', zIndex: '', image: '' }),
    floatButton: Object.freeze({ backgroundColor: '#2979ff', color: '#fff', width: '50px', height: '50px', borderColor: '', right: '30px', top: '', bottom: '', isMenu: false, list: Object.freeze([]) as readonly UPFloatButtonDefaultItem[] }),
    copy: Object.freeze({ content: '', alertStyle: 'toast', notice: '复制成功' }),
    choose: Object.freeze({ options: Object.freeze([]) as readonly UPChooseOption[], modelValue: false as const, type: 'radio', itemWidth: 'auto', itemHeight: '50px', itemPadding: '8px', labelName: 'title', valueName: 'value', customClick: false, wrap: true }),
  }),
});
