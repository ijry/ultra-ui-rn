import type { UPColorTokens } from './colors';
import { sourceDefaults, type UPProps } from './defaults';
import type { UPZIndex } from './z-index';

export type UPConfig = typeof sourceDefaults.config;

export type UPConfigState = {
  config: UPConfig;
  color: UPColorTokens;
  zIndex: UPZIndex;
  props: UPProps;
};

export type UPConfigOverrides = {
  config?: Partial<UPConfig>;
  color?: Partial<UPColorTokens>;
  zIndex?: Partial<UPZIndex>;
  props?: {
    button?: Partial<UPProps['button']>;
    icon?: Partial<UPProps['icon']>;
    text?: Partial<UPProps['text']>;
    tag?: Partial<UPProps['tag']>;
    badge?: Partial<UPProps['badge']>;
    gap?: Partial<UPProps['gap']>;
    line?: Partial<UPProps['line']>;
    divider?: Partial<UPProps['divider']>;
    section?: Partial<UPProps['section']>;
    box?: Partial<UPProps['box']>;
    cell?: Partial<UPProps['cell']>;
    cellGroup?: Partial<UPProps['cellGroup']>;
    image?: Partial<UPProps['image']>;
    avatar?: Partial<UPProps['avatar']>;
    card?: Partial<UPProps['card']>;
    empty?: Partial<UPProps['empty']>;
    skeleton?: Partial<UPProps['skeleton']>;
    row?: Partial<UPProps['row']>;
    col?: Partial<UPProps['col']>;
    grid?: Partial<UPProps['grid']>;
    gridItem?: Partial<UPProps['gridItem']>;
    input?: Partial<UPProps['input']>;
    picker?: Partial<UPProps['picker']>;
    datetimePicker?: Partial<UPProps['datetimePicker']>;
    cascader?: Partial<UPProps['cascader']>;
    cityLocate?: Partial<UPProps['cityLocate']>;
    calendar?: Partial<UPProps['calendar']>;
    calendarStrip?: Partial<UPProps['calendarStrip']>;
    textarea?: Partial<UPProps['textarea']>;
    search?: Partial<UPProps['search']>;
    switch?: Partial<UPProps['switch']>;
    checkbox?: Partial<UPProps['checkbox']>;
    checkboxGroup?: Partial<UPProps['checkboxGroup']>;
    radio?: Partial<UPProps['radio']>;
    radioGroup?: Partial<UPProps['radioGroup']>;
    rate?: Partial<UPProps['rate']>;
    slider?: Partial<UPProps['slider']>;
    numberBox?: Partial<UPProps['numberBox']>;
    codeInput?: Partial<UPProps['codeInput']>;
    code?: Partial<UPProps['code']>;
    keyboard?: Partial<UPProps['keyboard']>;
    numberKeyboard?: Partial<UPProps['numberKeyboard']>;
    carKeyboard?: Partial<UPProps['carKeyboard']>;
    tooltip?: Partial<UPProps['tooltip']>;
    dropdown?: Partial<UPProps['dropdown']>;
    dropdownItem?: Partial<UPProps['dropdownItem']>;
    navbar?: Partial<UPProps['navbar']>;
    navbarMini?: Partial<UPProps['navbarMini']>;
    cateTab?: Partial<UPProps['cateTab']>;
    canvas?: Partial<UPProps['canvas']>;
    qrcode?: Partial<UPProps['qrcode']>;
    barcode?: Partial<UPProps['barcode']>;
    tabbar?: Partial<UPProps['tabbar']>;
    tabbarItem?: Partial<UPProps['tabbarItem']>;
    form?: Partial<UPProps['form']>;
    formItem?: Partial<UPProps['formItem']>;
    transition?: Partial<UPProps['transition']>;
    overlay?: Partial<UPProps['overlay']>;
    popup?: Partial<UPProps['popup']>;
    modal?: Partial<UPProps['modal']>;
    actionSheet?: Partial<UPProps['actionSheet']>;
    loadingIcon?: Partial<UPProps['loadingIcon']>;
    loadingPage?: Partial<UPProps['loadingPage']>;
    toast?: Partial<UPProps['toast']>;
    notify?: Partial<UPProps['notify']>;
    lineProgress?: Partial<UPProps['lineProgress']>;
    circleProgress?: Partial<UPProps['circleProgress']>;
    loadmore?: Partial<UPProps['loadmore']>;
    pullRefresh?: Partial<UPProps['pullRefresh']>;
    countDown?: Partial<UPProps['countDown']>;
    countTo?: Partial<UPProps['countTo']>;
    statusBar?: Partial<UPProps['statusBar']>;
    safeBottom?: Partial<UPProps['safeBottom']>;
    noticeBar?: Partial<UPProps['noticeBar']>;
    columnNotice?: Partial<UPProps['columnNotice']>;
    rowNotice?: Partial<UPProps['rowNotice']>;
    swipeAction?: Partial<UPProps['swipeAction']>;
    swipeActionItem?: Partial<UPProps['swipeActionItem']>;
    readMore?: Partial<UPProps['readMore']>;
    sticky?: Partial<UPProps['sticky']>;
    backtop?: Partial<UPProps['backtop']>;
    link?: Partial<UPProps['link']>;
    alert?: Partial<UPProps['alert']>;
    avatarGroup?: Partial<UPProps['avatarGroup']>;
    album?: Partial<UPProps['album']>;
    upload?: Partial<UPProps['upload']>;
    lazyLoad?: Partial<UPProps['lazyLoad']>;
    tree?: Partial<UPProps['tree']>;
    waterfall?: Partial<UPProps['waterfall']>;
    indexList?: Partial<UPProps['indexList']>;
    indexAnchor?: Partial<UPProps['indexAnchor']>;
    subsection?: Partial<UPProps['subsection']>;
    collapse?: Partial<UPProps['collapse']>;
    collapseItem?: Partial<UPProps['collapseItem']>;
    steps?: Partial<UPProps['steps']>;
    stepsItem?: Partial<UPProps['stepsItem']>;
    toolbar?: Partial<UPProps['toolbar']>;
    scrollList?: Partial<UPProps['scrollList']>;
    tabs?: Partial<UPProps['tabs']>;
    pagination?: Partial<UPProps['pagination']>;
    table?: Partial<UPProps['table']>;
    swiper?: Partial<UPProps['swiper']>;
    swiperIndicator?: Partial<UPProps['swiperIndicator']>;
    list?: Partial<UPProps['list']>;
    listItem?: Partial<UPProps['listItem']>;
    virtualList?: Partial<UPProps['virtualList']>;
    refreshVirtualList?: Partial<UPProps['refreshVirtualList']>;
    dragsort?: Partial<UPProps['dragsort']>;
    signature?: Partial<UPProps['signature']>;
    guide?: Partial<UPProps['guide']>;
    agreement?: Partial<UPProps['agreement']>;
    noNetwork?: Partial<UPProps['noNetwork']>;
    floatButton?: Partial<UPProps['floatButton']>;
    copy?: Partial<UPProps['copy']>;
    choose?: Partial<UPProps['choose']>;
  };
};

const listeners = new Set<() => void>();

function createSourceState(): UPConfigState {
  return {
    config: { ...sourceDefaults.config },
    color: { ...sourceDefaults.color },
    zIndex: { ...sourceDefaults.zIndex },
    props: {
      button: { ...sourceDefaults.props.button },
      icon: { ...sourceDefaults.props.icon },
      text: { ...sourceDefaults.props.text },
      tag: { ...sourceDefaults.props.tag },
      badge: { ...sourceDefaults.props.badge },
      gap: { ...sourceDefaults.props.gap },
      line: { ...sourceDefaults.props.line },
      divider: { ...sourceDefaults.props.divider },
      section: { ...sourceDefaults.props.section },
      box: { ...sourceDefaults.props.box },
      cell: { ...sourceDefaults.props.cell },
      cellGroup: { ...sourceDefaults.props.cellGroup },
      image: { ...sourceDefaults.props.image },
      avatar: { ...sourceDefaults.props.avatar },
      card: { ...sourceDefaults.props.card },
      empty: { ...sourceDefaults.props.empty },
      skeleton: { ...sourceDefaults.props.skeleton },
      row: { ...sourceDefaults.props.row },
      col: { ...sourceDefaults.props.col },
      grid: { ...sourceDefaults.props.grid },
      gridItem: { ...sourceDefaults.props.gridItem },
      input: { ...sourceDefaults.props.input },
      picker: { ...sourceDefaults.props.picker },
      datetimePicker: { ...sourceDefaults.props.datetimePicker },
      cascader: { ...sourceDefaults.props.cascader },
      cityLocate: { ...sourceDefaults.props.cityLocate },
      calendar: { ...sourceDefaults.props.calendar },
      calendarStrip: { ...sourceDefaults.props.calendarStrip },
      textarea: { ...sourceDefaults.props.textarea },
      search: { ...sourceDefaults.props.search },
      switch: { ...sourceDefaults.props.switch },
      checkbox: { ...sourceDefaults.props.checkbox },
      checkboxGroup: { ...sourceDefaults.props.checkboxGroup },
      radio: { ...sourceDefaults.props.radio },
      radioGroup: { ...sourceDefaults.props.radioGroup },
      rate: { ...sourceDefaults.props.rate },
      slider: { ...sourceDefaults.props.slider },
      numberBox: { ...sourceDefaults.props.numberBox },
      codeInput: { ...sourceDefaults.props.codeInput },
      code: { ...sourceDefaults.props.code },
      keyboard: { ...sourceDefaults.props.keyboard },
      numberKeyboard: { ...sourceDefaults.props.numberKeyboard },
      carKeyboard: { ...sourceDefaults.props.carKeyboard },
      tooltip: { ...sourceDefaults.props.tooltip },
      dropdown: { ...sourceDefaults.props.dropdown },
      dropdownItem: { ...sourceDefaults.props.dropdownItem },
      navbar: { ...sourceDefaults.props.navbar },
      navbarMini: { ...sourceDefaults.props.navbarMini },
      cateTab: { ...sourceDefaults.props.cateTab },
      canvas: { ...sourceDefaults.props.canvas },
      qrcode: { ...sourceDefaults.props.qrcode },
      barcode: { ...sourceDefaults.props.barcode },
      tabbar: { ...sourceDefaults.props.tabbar },
      tabbarItem: { ...sourceDefaults.props.tabbarItem },
      form: { ...sourceDefaults.props.form },
      formItem: { ...sourceDefaults.props.formItem },
      transition: { ...sourceDefaults.props.transition },
      overlay: { ...sourceDefaults.props.overlay },
      popup: { ...sourceDefaults.props.popup },
      modal: { ...sourceDefaults.props.modal },
      actionSheet: { ...sourceDefaults.props.actionSheet },
      loadingIcon: { ...sourceDefaults.props.loadingIcon },
      loadingPage: { ...sourceDefaults.props.loadingPage },
      toast: { ...sourceDefaults.props.toast },
      notify: { ...sourceDefaults.props.notify },
      lineProgress: { ...sourceDefaults.props.lineProgress },
      circleProgress: { ...sourceDefaults.props.circleProgress },
      loadmore: { ...sourceDefaults.props.loadmore },
      pullRefresh: { ...sourceDefaults.props.pullRefresh },
      countDown: { ...sourceDefaults.props.countDown },
      countTo: { ...sourceDefaults.props.countTo },
      statusBar: { ...sourceDefaults.props.statusBar },
      safeBottom: { ...sourceDefaults.props.safeBottom },
      noticeBar: { ...sourceDefaults.props.noticeBar },
      columnNotice: { ...sourceDefaults.props.columnNotice },
      rowNotice: { ...sourceDefaults.props.rowNotice },
      swipeAction: { ...sourceDefaults.props.swipeAction },
      swipeActionItem: { ...sourceDefaults.props.swipeActionItem },
      readMore: { ...sourceDefaults.props.readMore },
      sticky: { ...sourceDefaults.props.sticky },
      backtop: { ...sourceDefaults.props.backtop },
      link: { ...sourceDefaults.props.link },
      alert: { ...sourceDefaults.props.alert },
      avatarGroup: { ...sourceDefaults.props.avatarGroup },
      album: { ...sourceDefaults.props.album },
      upload: { ...sourceDefaults.props.upload },
      lazyLoad: { ...sourceDefaults.props.lazyLoad },
      tree: { ...sourceDefaults.props.tree },
      waterfall: { ...sourceDefaults.props.waterfall },
      indexList: { ...sourceDefaults.props.indexList },
      indexAnchor: { ...sourceDefaults.props.indexAnchor },
      subsection: { ...sourceDefaults.props.subsection },
      collapse: { ...sourceDefaults.props.collapse },
      collapseItem: { ...sourceDefaults.props.collapseItem },
      steps: { ...sourceDefaults.props.steps },
      stepsItem: { ...sourceDefaults.props.stepsItem },
      toolbar: { ...sourceDefaults.props.toolbar },
      scrollList: { ...sourceDefaults.props.scrollList },
      tabs: { ...sourceDefaults.props.tabs },
      pagination: { ...sourceDefaults.props.pagination },
      table: { ...sourceDefaults.props.table },
      swiper: { ...sourceDefaults.props.swiper },
      swiperIndicator: { ...sourceDefaults.props.swiperIndicator },
      list: { ...sourceDefaults.props.list },
      listItem: { ...sourceDefaults.props.listItem },
      virtualList: { ...sourceDefaults.props.virtualList },
      refreshVirtualList: { ...sourceDefaults.props.refreshVirtualList },
      dragsort: { ...sourceDefaults.props.dragsort },
      signature: { ...sourceDefaults.props.signature },
      guide: { ...sourceDefaults.props.guide },
      agreement: { ...sourceDefaults.props.agreement },
      noNetwork: { ...sourceDefaults.props.noNetwork },
      floatButton: { ...sourceDefaults.props.floatButton },
      copy: { ...sourceDefaults.props.copy },
      choose: { ...sourceDefaults.props.choose },
    },
  };
}

let state = createSourceState();

function publish(): void {
  listeners.forEach((listener) => listener());
}

export function setUPConfig(overrides: UPConfigOverrides): void {
  state = {
    config: { ...state.config, ...overrides.config },
    color: { ...state.color, ...overrides.color },
    zIndex: { ...state.zIndex, ...overrides.zIndex },
    props: {
      button: { ...state.props.button, ...overrides.props?.button },
      icon: { ...state.props.icon, ...overrides.props?.icon },
      text: { ...state.props.text, ...overrides.props?.text },
      tag: { ...state.props.tag, ...overrides.props?.tag },
      badge: { ...state.props.badge, ...overrides.props?.badge },
      gap: { ...state.props.gap, ...overrides.props?.gap },
      line: { ...state.props.line, ...overrides.props?.line },
      divider: { ...state.props.divider, ...overrides.props?.divider },
      section: { ...state.props.section, ...overrides.props?.section },
      box: { ...state.props.box, ...overrides.props?.box },
      cell: { ...state.props.cell, ...overrides.props?.cell },
      cellGroup: { ...state.props.cellGroup, ...overrides.props?.cellGroup },
      image: { ...state.props.image, ...overrides.props?.image },
      avatar: { ...state.props.avatar, ...overrides.props?.avatar },
      card: { ...state.props.card, ...overrides.props?.card },
      empty: { ...state.props.empty, ...overrides.props?.empty },
      skeleton: { ...state.props.skeleton, ...overrides.props?.skeleton },
      row: { ...state.props.row, ...overrides.props?.row },
      col: { ...state.props.col, ...overrides.props?.col },
      grid: { ...state.props.grid, ...overrides.props?.grid },
      gridItem: { ...state.props.gridItem, ...overrides.props?.gridItem },
      input: { ...state.props.input, ...overrides.props?.input },
      picker: { ...state.props.picker, ...overrides.props?.picker },
      datetimePicker: { ...state.props.datetimePicker, ...overrides.props?.datetimePicker },
      cascader: { ...state.props.cascader, ...overrides.props?.cascader },
      cityLocate: { ...state.props.cityLocate, ...overrides.props?.cityLocate },
      calendar: { ...state.props.calendar, ...overrides.props?.calendar },
      calendarStrip: { ...state.props.calendarStrip, ...overrides.props?.calendarStrip },
      textarea: { ...state.props.textarea, ...overrides.props?.textarea },
      search: { ...state.props.search, ...overrides.props?.search },
      switch: { ...state.props.switch, ...overrides.props?.switch },
      checkbox: { ...state.props.checkbox, ...overrides.props?.checkbox },
      checkboxGroup: { ...state.props.checkboxGroup, ...overrides.props?.checkboxGroup },
      radio: { ...state.props.radio, ...overrides.props?.radio },
      radioGroup: { ...state.props.radioGroup, ...overrides.props?.radioGroup },
      rate: { ...state.props.rate, ...overrides.props?.rate },
      slider: { ...state.props.slider, ...overrides.props?.slider },
      numberBox: { ...state.props.numberBox, ...overrides.props?.numberBox },
      codeInput: { ...state.props.codeInput, ...overrides.props?.codeInput },
      code: { ...state.props.code, ...overrides.props?.code },
      keyboard: { ...state.props.keyboard, ...overrides.props?.keyboard },
      numberKeyboard: { ...state.props.numberKeyboard, ...overrides.props?.numberKeyboard },
      carKeyboard: { ...state.props.carKeyboard, ...overrides.props?.carKeyboard },
      tooltip: { ...state.props.tooltip, ...overrides.props?.tooltip },
      dropdown: { ...state.props.dropdown, ...overrides.props?.dropdown },
      dropdownItem: { ...state.props.dropdownItem, ...overrides.props?.dropdownItem },
      navbar: { ...state.props.navbar, ...overrides.props?.navbar },
      navbarMini: { ...state.props.navbarMini, ...overrides.props?.navbarMini },
      cateTab: { ...state.props.cateTab, ...overrides.props?.cateTab },
      canvas: { ...state.props.canvas, ...overrides.props?.canvas },
      qrcode: { ...state.props.qrcode, ...overrides.props?.qrcode },
      barcode: { ...state.props.barcode, ...overrides.props?.barcode },
      tabbar: { ...state.props.tabbar, ...overrides.props?.tabbar },
      tabbarItem: { ...state.props.tabbarItem, ...overrides.props?.tabbarItem },
      form: { ...state.props.form, ...overrides.props?.form },
      formItem: { ...state.props.formItem, ...overrides.props?.formItem },
      transition: { ...state.props.transition, ...overrides.props?.transition },
      overlay: { ...state.props.overlay, ...overrides.props?.overlay },
      popup: { ...state.props.popup, ...overrides.props?.popup },
      modal: { ...state.props.modal, ...overrides.props?.modal },
      actionSheet: { ...state.props.actionSheet, ...overrides.props?.actionSheet },
      loadingIcon: { ...state.props.loadingIcon, ...overrides.props?.loadingIcon },
      loadingPage: { ...state.props.loadingPage, ...overrides.props?.loadingPage },
      toast: { ...state.props.toast, ...overrides.props?.toast },
      notify: { ...state.props.notify, ...overrides.props?.notify },
      lineProgress: { ...state.props.lineProgress, ...overrides.props?.lineProgress },
      circleProgress: { ...state.props.circleProgress, ...overrides.props?.circleProgress },
      loadmore: { ...state.props.loadmore, ...overrides.props?.loadmore },
      pullRefresh: { ...state.props.pullRefresh, ...overrides.props?.pullRefresh },
      countDown: { ...state.props.countDown, ...overrides.props?.countDown },
      countTo: { ...state.props.countTo, ...overrides.props?.countTo },
      statusBar: { ...state.props.statusBar, ...overrides.props?.statusBar },
      safeBottom: { ...state.props.safeBottom, ...overrides.props?.safeBottom },
      noticeBar: { ...state.props.noticeBar, ...overrides.props?.noticeBar },
      columnNotice: { ...state.props.columnNotice, ...overrides.props?.columnNotice },
      rowNotice: { ...state.props.rowNotice, ...overrides.props?.rowNotice },
      swipeAction: { ...state.props.swipeAction, ...overrides.props?.swipeAction },
      swipeActionItem: { ...state.props.swipeActionItem, ...overrides.props?.swipeActionItem },
      readMore: { ...state.props.readMore, ...overrides.props?.readMore },
      sticky: { ...state.props.sticky, ...overrides.props?.sticky },
      backtop: { ...state.props.backtop, ...overrides.props?.backtop },
      link: { ...state.props.link, ...overrides.props?.link },
      alert: { ...state.props.alert, ...overrides.props?.alert },
      avatarGroup: { ...state.props.avatarGroup, ...overrides.props?.avatarGroup },
      album: { ...state.props.album, ...overrides.props?.album },
      upload: { ...state.props.upload, ...overrides.props?.upload },
      lazyLoad: { ...state.props.lazyLoad, ...overrides.props?.lazyLoad },
      tree: { ...state.props.tree, ...overrides.props?.tree },
      waterfall: { ...state.props.waterfall, ...overrides.props?.waterfall },
      indexList: { ...state.props.indexList, ...overrides.props?.indexList },
      indexAnchor: { ...state.props.indexAnchor, ...overrides.props?.indexAnchor },
      subsection: { ...state.props.subsection, ...overrides.props?.subsection },
      collapse: { ...state.props.collapse, ...overrides.props?.collapse },
      collapseItem: { ...state.props.collapseItem, ...overrides.props?.collapseItem },
      steps: { ...state.props.steps, ...overrides.props?.steps },
      stepsItem: { ...state.props.stepsItem, ...overrides.props?.stepsItem },
      toolbar: { ...state.props.toolbar, ...overrides.props?.toolbar },
      scrollList: { ...state.props.scrollList, ...overrides.props?.scrollList },
      tabs: { ...state.props.tabs, ...overrides.props?.tabs },
      pagination: { ...state.props.pagination, ...overrides.props?.pagination },
      table: { ...state.props.table, ...overrides.props?.table },
      swiper: { ...state.props.swiper, ...overrides.props?.swiper },
      swiperIndicator: { ...state.props.swiperIndicator, ...overrides.props?.swiperIndicator },
      list: { ...state.props.list, ...overrides.props?.list },
      listItem: { ...state.props.listItem, ...overrides.props?.listItem },
      virtualList: { ...state.props.virtualList, ...overrides.props?.virtualList },
      refreshVirtualList: { ...state.props.refreshVirtualList, ...overrides.props?.refreshVirtualList },
      dragsort: { ...state.props.dragsort, ...overrides.props?.dragsort },
      signature: { ...state.props.signature, ...overrides.props?.signature },
      guide: { ...state.props.guide, ...overrides.props?.guide },
      agreement: { ...state.props.agreement, ...overrides.props?.agreement },
      noNetwork: { ...state.props.noNetwork, ...overrides.props?.noNetwork },
      floatButton: { ...state.props.floatButton, ...overrides.props?.floatButton },
      copy: { ...state.props.copy, ...overrides.props?.copy },
      choose: { ...state.props.choose, ...overrides.props?.choose },
    },
  };
  publish();
}

export function getUPConfig(): Readonly<UPConfigState> {
  return state;
}

export function subscribeUPConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetUPConfigForTests(): void {
  state = createSourceState();
  publish();
}
