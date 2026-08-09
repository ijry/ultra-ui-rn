import React, { useMemo, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  UP,
  UPActionSheet,
  UPAgreement,
  type UPAgreementRef,
  UPAlbum,
  UPAlert,
  UPBackTop,
  UPBadge,
  UPAvatar,
  UPAvatarGroup,
  UPBarcode,
  UPBox,
  UPButton,
  UPCard,
  UPCalendar,
  UPCalendarStrip,
  UPCanvas,
  UPCascader,
  UPCateTab,
  UPCell,
  UPCellGroup,
  UPCheckbox,
  UPCheckboxGroup,
  UPChoose,
  UPCol,
  UPColumnNotice,
  UPCode,
  type UPCodeRef,
  UPCodeInput,
  UPCollapse,
  UPCollapseItem,
  UPCopy,
  UPCountDown,
  UPCountTo,
  UPCityLocate,
  UPCircleProgress,
  UPDatetimePicker,
  UPDivider,
  UPDragsort,
  UPDropdown,
  UPDropdownItem,
  UPEmpty,
  UPForm,
  UPFormItem,
  UPFloatButton,
  type UPFormRef,
  UPGap,
  UPGrid,
  UPGridItem,
  UPGuide,
  UPIcon,
  UPImage,
  UPIndexAnchor,
  UPIndexItem,
  UPIndexList,
  UPLazyLoad,
  UPLine,
  UPLineProgress,
  UPLink,
  UPList,
  UPListItem,
  UPLoadingPage,
  UPLoadmore,
  UPModal,
  UPNavbar,
  UPNavbarMini,
  UPNoticeBar,
  UPNoNetwork,
  UPNotify,
  UPInput,
  UPKeyboard,
  UPNumberBox,
  UPPagination,
  UPPicker,
  UPPickerData,
  UPPullRefresh,
  UPRadio,
  UPRadioGroup,
  UPRefreshVirtualList,
  UPRow,
  UPRowNotice,
  UPRoot,
  UPPopup,
  UPQrcode,
  UPSection,
  UPSafeBottom,
  UPScrollHost,
  UPScrollList,
  UPSignature,
  type UPSignatureRef,
  UPSkeleton,
  UPSelect,
  UPSwiper,
  UPSwitch,
  UPSticky,
  UPStatusBar,
  UPSteps,
  UPStepsItem,
  UPSubsection,
  UPSwipeAction,
  UPSwipeActionItem,
  UPTag,
  UPTable,
  UPTd,
  UPTabs,
  UPTabbar,
  UPTabbarItem,
  UPText,
  UPTh,
  UPTooltip,
  UPTitle,
  UPToolbar,
  UPTr,
  UPTree,
  UPUpload,
  type UPUploadAdapter,
  UPVirtualList,
  UPView,
  UPWaterfall,
} from 'ultra-ui-rn';

const demoCascaderData = [
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      { label: '杭州市', value: 'hangzhou' },
      { label: '宁波市', value: 'ningbo' },
    ],
  },
  {
    label: '广东省',
    value: 'guangdong',
    children: [{ label: '深圳市', value: 'shenzhen' }],
  },
] as const;

const demoCategoryTabs = [
  {
    name: '手机',
    children: [
      {
        name: 'iPhone',
        icon: 'https://dummyimage.com/80x80/edf2f7/334155.png&text=iPhone',
      },
      { name: 'Android' },
    ],
  },
  {
    name: '电脑',
    children: [{ name: 'Mac' }, { name: 'Windows' }],
  },
  {
    name: '配件',
    children: [{ name: '键盘' }, { name: '耳机' }],
  },
] as const;

const demoVirtualRows = Array.from({ length: 60 }, (_, index) => ({
  id: `virtual-${index}`,
  name: `Virtual row ${index + 1}`,
}));

const demoDragRows = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Charlie' },
] as const;

const demoGuidePages = [
  { desc: 'PanResponder 拖拽排序', title: 'UPDragsort' },
  { desc: 'UPCanvas 签名导出', title: 'UPSignature' },
  { desc: 'Overlay 全屏引导', title: 'UPGuide' },
] as const;

const demoTree = [
  {
    id: 'media',
    label: 'Media',
    children: [
      { id: 'images', label: 'Images' },
      { id: 'videos', label: 'Videos' },
    ],
  },
  { id: 'settings', label: 'Settings' },
] as const;

const demoWaterfallItems = [
  { id: 'card-1', title: 'Short card', height: 96 },
  { id: 'card-2', title: 'Tall card', height: 156 },
  { id: 'card-3', title: 'Medium card', height: 124 },
  { id: 'card-4', title: 'Another card', height: 180 },
] as const;

function App() {
  const [clicks, setClicks] = useState(0);
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [choices, setChoices] = useState<(string | number | boolean)[]>(['news']);
  const [chooseIndex, setChooseIndex] = useState(0);
  const [columnNoticeVisible, setColumnNoticeVisible] = useState(true);
  const [columnNoticeIndex, setColumnNoticeIndex] = useState(0);
  const [rowNoticeVisible, setRowNoticeVisible] = useState(true);
  const [rowNoticeClicks, setRowNoticeClicks] = useState(0);
  const [lastSwipeAction, setLastSwipeAction] = useState('');
  const [lastAlbumPreview, setLastAlbumPreview] = useState('none');
  const [selectedIndex, setSelectedIndex] = useState('A');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarValue, setCalendarValue] = useState('');
  const [calendarStripDate, setCalendarStripDate] = useState('2024-05-10');
  const [datetimeOpen, setDatetimeOpen] = useState(false);
  const [datetimeValue, setDatetimeValue] = useState(new Date(2024, 4, 3, 9, 30).getTime());
  const [cascaderOpen, setCascaderOpen] = useState(false);
  const [cascaderValue, setCascaderValue] = useState<(string | number | boolean | null)[]>([]);
  const [locatedCity, setLocatedCity] = useState('');
  const [cateCurrent, setCateCurrent] = useState(0);
  const [navigationEvent, setNavigationEvent] = useState('none');
  const [pickerValue, setPickerValue] = useState<(string | number | boolean)[]>(['red', 'Small']);
  const [pickerDataValue, setPickerDataValue] = useState<string | number>(0);
  const [selectValue, setSelectValue] = useState<string | number>('first');
  const [delivery, setDelivery] = useState<string | number>('standard');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardValue, setKeyboardValue] = useState('');
  const [tooltipAction, setTooltipAction] = useState('none');
  const [shipping, setShipping] = useState<string | number | boolean>('standard');
  const [quantity, setQuantity] = useState(1);
  const [code, setCode] = useState('');
  const [codePrompt, setCodePrompt] = useState('获取验证码');
  const [profile, setProfile] = useState({ email: '' });
  const [formStatus, setFormStatus] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(35);
  const [loadStatus, setLoadStatus] = useState<'loadmore' | 'loading' | 'nomore'>('loadmore');
  const [subsectionIndex, setSubsectionIndex] = useState(0);
  const [openCollapseNames, setOpenCollapseNames] = useState<(string | number)[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string | number>('home');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [slide, setSlide] = useState(0);
  const [connected, setConnected] = useState(true);
  const [copiedValue, setCopiedValue] = useState('');
  const [guideVisible, setGuideVisible] = useState(false);
  const formRef = useRef<UPFormRef>(null);
  const agreementRef = useRef<UPAgreementRef>(null);
  const codeRef = useRef<UPCodeRef>(null);
  const signatureRef = useRef<UPSignatureRef>(null);
  const guideStorage = useMemo(() => {
    const values: Record<string, string> = {};
    return {
      getItem: async (key: string) => values[key],
      removeItem: async (key: string) => {
        delete values[key];
      },
      setItem: async (key: string, value: string) => {
        values[key] = value;
      },
    };
  }, []);
  const uploadAdapter = useMemo<UPUploadAdapter>(() => ({
    chooseFile: async () => [
      { name: 'demo-image.jpg', size: 128, type: 'image/jpeg', uri: 'https://picsum.photos/seed/upload/300/300' },
    ],
    previewFile: async (file) => {
      console.log('preview file', file.uri);
    },
    uploadFile: async ({ file, onProgress }) => {
      onProgress(45);
      console.log('upload file', file.uri);
      return { demo: true };
    },
  }), []);
  const demoWriteText = (value: string) => {
    setCopiedValue(value);
  };

  return (
    <UPRoot>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        <UPStatusBar bgColor="#f3f4f6" />
        <UPScrollHost
          contentContainerStyle={styles.content}
          overlay={<UPBackTop top={160} />}
        >
          <Text style={styles.title}>ultra-ui-rn / uview-plus P19 essentials</Text>
          <UPSticky>
            <UPNoticeBar
              mode="closable"
              text="P5 scroll surfaces use an explicit native ScrollView host."
            />
          </UPSticky>
          {columnNoticeVisible ? (
            <UPColumnNotice
              mode="closable"
              text={[
                'P14 default step=false pages vertically.',
                'Swipe can be enabled with disableTouch={false}.',
              ]}
              onClick={setColumnNoticeIndex}
              onClose={() => setColumnNoticeVisible(false)}
            />
          ) : (
            <UPButton
              plain
              text="Restore column notice"
              onClick={() => setColumnNoticeVisible(true)}
            />
          )}
          <Text>Selected column notice index: {columnNoticeIndex}</Text>
          {rowNoticeVisible ? (
            <UPRowNotice
              mode="closable"
              text="P15 measures its native text width for a source-speed marquee."
              onClick={() => setRowNoticeClicks((value) => value + 1)}
              onClose={() => setRowNoticeVisible(false)}
            />
          ) : (
            <UPButton plain text="Restore row notice" onClick={() => setRowNoticeVisible(true)} />
          )}
          <Text>Row notice clicks: {rowNoticeClicks}</Text>
          <Text style={styles.section}>Swipe actions</Text>
          <UPSwipeAction>
            <UPSwipeActionItem
              name="invoice-42"
              options={[
                { icon: 'chat', style: { backgroundColor: '#3c9cff' }, text: 'Reply' },
                { icon: 'trash', style: { backgroundColor: '#fa3534' }, text: 'Delete' },
              ]}
              onClick={({ index, name }) => setLastSwipeAction(`${name}:${index}`)}
            >
              <UPCell title="Invoice #42" value="Swipe left" />
            </UPSwipeActionItem>
            <UPSwipeActionItem
              name="invoice-43"
              options={[{ icon: 'trash', style: { backgroundColor: '#fa3534' }, text: 'Delete' }]}
              onClick={({ index, name }) => setLastSwipeAction(`${name}:${index}`)}
            >
              <UPCell title="Invoice #43" value="Swipe left" />
            </UPSwipeActionItem>
          </UPSwipeAction>
          <Text>Last swipe action: {lastSwipeAction || 'none'}</Text>
          <Text style={styles.section}>Album</Text>
          <UPAlbum
            maxCount={4}
            multipleSize={72}
            urls={[
              'https://picsum.photos/id/10/300/300',
              'https://picsum.photos/id/20/300/300',
              'https://picsum.photos/id/30/300/300',
              'https://picsum.photos/id/40/300/300',
              'https://picsum.photos/id/50/300/300',
            ]}
            onPreview={({ currentIndex, urls }) => {
              setLastAlbumPreview(`${currentIndex + 1}/${urls.length}`);
            }}
          />
          <Text>Host preview callback: {lastAlbumPreview}</Text>
          <UPUpload uploadAdapter={uploadAdapter} />
          <UPLazyLoad
            height={120}
            src="https://picsum.photos/seed/lazy-load/600/240"
            visible
            width="100%"
          />
          <Text style={styles.section}>Tree</Text>
          <UPTree
            data={demoTree}
            defaultExpandedKeys={['media']}
            height={180}
            renderNode={({ label, level }) => <UPText text={`${'  '.repeat(level)}${label}`} />}
            showCheckbox
          />
          <Text style={styles.section}>Waterfall</Text>
          <UPWaterfall
            columns={2}
            height={260}
            renderItem={({ item }) => (
              <UPCard
                customStyle={{ height: item.height, margin: 4 }}
                title={item.title}
              >
                <UPText text={`Item ${item.id}`} />
              </UPCard>
            )}
            value={demoWaterfallItems}
          />
          <Text style={styles.section}>Index list</Text>
          <UPIndexList
            height={240}
            indexList={['A', 'B', 'C']}
            onSelect={(index) => setSelectedIndex(String(index))}
          >
            <UPIndexItem index="A">
              <UPIndexAnchor text="A" />
              <UPCell title="Amsterdam" />
              <UPCell title="Athens" />
            </UPIndexItem>
            <UPIndexItem index="B">
              <UPIndexAnchor text="B" />
              <UPCell title="Berlin" />
              <UPCell title="Boston" />
            </UPIndexItem>
            <UPIndexItem index="C">
              <UPIndexAnchor text="C" />
              <UPCell title="Chicago" />
              <UPCell title="Copenhagen" />
            </UPIndexItem>
          </UPIndexList>
          <Text>Selected index: {selectedIndex}</Text>
          <Text>Tap or drag the right rail to jump between registered groups.</Text>
          <Text style={styles.section}>Buttons</Text>
          <View style={styles.row}>
            <UPButton
              text="Info"
              onClick={() => setClicks((value) => value + 1)}
            />
            <UPButton text="Primary" type="primary" />
            <UPButton plain text="Plain" type="success" />
          </View>
          <View style={styles.row}>
            <UPButton disabled text="Disabled" />
            <UPButton loading loadingText="Loading" text="Loading" type="warning" />
          </View>
          <Text testID="click-count">Clicks: {clicks}</Text>
          <Text style={styles.section}>Icons</Text>
          <View style={styles.row}>
            <UPIcon color="primary" label="Search" name="search" />
            <UPIcon
              color="success"
              label="Done"
              name="checkmark-circle-fill"
            />
            <UPIcon color="error" label="Error" name="error-circle-fill" />
          </View>
          <Text style={styles.section}>Text, Tags, Badges</Text>
          <UPText mode="price" prefixIcon="rmb" text="199" type="error" />
          <UPText format="encrypt" mode="phone" text="13812345678" />
          <View style={styles.row}>
            <UPTag closable plain plainFill text="New" type="primary" />
            <UPTag icon="checkmark" text="Ready" type="success" />
            <UPBadge value={12}>
              <UPIcon name="bell" size={28} />
            </UPBadge>
          </View>
          <Text style={styles.section}>Layout</Text>
          <UPGap bgColor="#e8eaed" height="20px" />
          <UPLine dashed />
          <UPDivider text="No more" />
          <UPTitle>
            <Text style={styles.titleText}>Recommended</Text>
          </UPTitle>
          <UPSection title="Popular content" />
          <UPView backgroundColor="#ffffff" padding="12px">
            <UPText text="UPView maps source style props to native View styles." />
          </UPView>
          <UPBox />
          <Text style={styles.section}>Media and Content</Text>
          <View style={styles.row}>
            <UPAvatar text="UP" />
            <UPAvatar icon="person" shape="square" />
            <UPImage
              height="64px"
              src="https://picsum.photos/128"
              width="64px"
            />
          </View>
          <UPCellGroup title="Profile">
            <UPCell isLink label="Account preferences" title="Settings" value="Configured" />
            <UPCell icon="email" title="Messages" value="2" />
          </UPCellGroup>
          <UPCard foot={<UPText text="Card footer" />} title="Source-style card">
            <UPText text="Card body supports arbitrary React Native content." />
          </UPCard>
          <UPSkeleton avatar rows={2} />
          <UPEmpty text="No results" />
          <Text style={styles.section}>Display State</Text>
          <UPAlert closable description="Native source-compatible alert surface." showIcon title="Announcement" />
          <View style={styles.row}>
            <UPLink href="https://uviewui.com" text="uView documentation" underLine />
            <UPAvatarGroup
              maxCount={2}
              urls={[
                'https://picsum.photos/80?1',
                'https://picsum.photos/80?2',
                'https://picsum.photos/80?3',
              ]}
            />
          </View>
          <UPSubsection
            current={subsectionIndex}
            list={['Daily', 'Weekly', 'Monthly']}
            onUpdateCurrent={setSubsectionIndex}
          />
          <Text>Selected range: {['Daily', 'Weekly', 'Monthly'][subsectionIndex]}</Text>
          <UPCollapse
            onChange={(items) => setOpenCollapseNames(
              items.filter((item) => item.status === 'open').map((item) => item.name),
            )}
            value={openCollapseNames}
          >
            <UPCollapseItem name="details" title="Expandable details">
              <UPText text="Collapse items preserve source open/close state payloads." />
            </UPCollapseItem>
            <UPCollapseItem label="Current delivery state" name="shipping" title="Shipping">
              <UPText text="Packed and ready for carrier handoff." />
            </UPCollapseItem>
          </UPCollapse>
          <UPSteps current={1}>
            <UPStepsItem desc="10:00" title="Packed" />
            <UPStepsItem desc="10:30" title="Shipped" />
            <UPStepsItem title="Delivered" />
          </UPSteps>
          <Text style={styles.section}>Navigation Surfaces</Text>
          <UPToolbar
            onCancel={() => UP.toast.default('Filter cancelled')}
            onConfirm={() => UP.toast.success('Filter applied')}
            title="Filters"
          />
          <UPTabs
            current={tabIndex}
            list={[{ name: 'News' }, { name: 'Saved' }, { disabled: true, name: 'Locked' }]}
            onUpdateCurrent={setTabIndex}
          />
          <Text>Selected tab: {['News', 'Saved', 'Locked'][tabIndex]}</Text>
          <UPScrollList>
            <View style={styles.scrollCard}><UPText text="Trending" /></View>
            <View style={styles.scrollCard}><UPText text="Following" /></View>
            <View style={styles.scrollCard}><UPText text="Recommended" /></View>
          </UPScrollList>
          <UPPagination
            currentPage={page}
            layout="prev, pager, total, sizes, next"
            onCurrentChange={setPage}
            onSizeChange={setPageSize}
            pageSize={pageSize}
            total={95}
          />
          <Text style={styles.section}>Static Table</Text>
          <UPTable align="left">
            <UPTr>
              <UPTh width="50%">Metric</UPTh>
              <UPTh>Value</UPTh>
            </UPTr>
            <UPTr>
              <UPTd width="50%">Orders</UPTd>
              <UPTd>128</UPTd>
            </UPTr>
            <UPTr>
              <UPTd width="50%">Conversion</UPTd>
              <UPTd color="#5ac725">4.8%</UPTd>
            </UPTr>
          </UPTable>
          <Text style={styles.section}>Swiper</Text>
          <UPSwiper
            current={slide}
            indicator
            list={[
              { title: 'Spring collection', url: 'https://picsum.photos/seed/spring/800/320' },
              { title: 'Summer collection', url: 'https://picsum.photos/seed/summer/800/320' },
            ]}
            onUpdateCurrent={setSlide}
          />
          <Text>Selected slide: {slide + 1}</Text>
          <Text style={styles.section}>List</Text>
          <UPList height={180} lowerThreshold={20} onScrollToLower={() => UP.toast.default('Reached the end of the list')}>
            <UPListItem anchor="profile"><UPCell title="Profile" /></UPListItem>
            <UPListItem anchor="settings"><UPCell title="Settings" /></UPListItem>
            <UPListItem anchor="security"><UPCell title="Security" /></UPListItem>
          </UPList>
          <Text style={styles.section}>List Enhancements</Text>
          <UPPullRefresh
            height={140}
            onRefresh={() => UP.toast.default('Refresh requested')}
            showLoadmore
          >
            <UPCell title="Pull refresh content" value="Drag down" />
          </UPPullRefresh>
          <UPVirtualList
            height={180}
            itemHeight={44}
            listData={demoVirtualRows}
            renderItem={({ item }) => <UPCell title={item.name} />}
          />
          <UPRefreshVirtualList
            height={180}
            itemHeight={44}
            listData={demoVirtualRows}
            onRefresh={() => UP.toast.default('Virtual refresh requested')}
            renderItem={({ item }) => <UPCell title={item.name} />}
          />
          <Text style={styles.section}>Interaction Tools</Text>
          <UPDragsort
            initialList={demoDragRows}
            itemHeight={48}
            onDragEnd={() => UP.toast.default('Drag sorted')}
          />
          <UPSignature
            canvasProps={{ canvasId: 'example-signature' }}
            onConfirm={(result) => UP.toast.success(`Signature: ${result.tempFilePath}`)}
            ref={signatureRef}
          />
          <View style={styles.row}>
            <UPButton plain text="清除签名" onClick={() => signatureRef.current?.clear()} />
            <UPButton text="确认签名" onClick={() => { void signatureRef.current?.confirm(); }} />
          </View>
          <View style={styles.row}>
            <UPButton text="打开引导" onClick={() => setGuideVisible(true)} />
          </View>
          <UPGuide
            list={demoGuidePages}
            onUpdateShow={setGuideVisible}
            show={guideVisible}
            storage={guideStorage}
            storageKey="example-p31-guide"
          />
          <Text style={styles.section}>Utility Surfaces</Text>
          <View style={styles.row}>
            <UPButton text="Agreement" onClick={() => agreementRef.current?.showModal()} />
            <UPButton plain text="Simulate offline" onClick={() => setConnected(false)} />
          </View>
          <UPAgreement ref={agreementRef} onConfirm={() => UP.toast.success('Agreement accepted')} />
          <UPCopy
            content="INV-2026-0007"
            onSuccess={() => UP.toast.success('Copy adapter completed')}
            writeText={demoWriteText}
          >
            <UPButton plain text="Copy demo invoice" />
          </UPCopy>
          <Text>Demo adapter received: {copiedValue || 'nothing yet'}</Text>
          <Text style={styles.section}>Grid</Text>
          <UPRow gutter="12px">
            <UPCol span={6}>
              <UPTag text="Half column" type="primary" />
            </UPCol>
            <UPCol span={6}>
              <UPTag plain text="Half column" type="success" />
            </UPCol>
          </UPRow>
          <UPGrid border col={3} gap="4px">
            <UPGridItem name="one"><UPText align="center" text="One" /></UPGridItem>
            <UPGridItem name="two"><UPText align="center" text="Two" /></UPGridItem>
            <UPGridItem name="three"><UPText align="center" text="Three" /></UPGridItem>
          </UPGrid>
          <Text style={styles.section}>Inputs and Selection</Text>
          <UPInput clearable placeholder="Search text" value={query} onChange={setQuery} />
          <UPSwitch value={enabled} onChange={(value) => setEnabled(value === true)} />
          <UPCheckboxGroup value={choices} onChange={setChoices}>
            <UPCheckbox label="News" name="news" />
            <UPCheckbox label="Offers" name="offers" />
          </UPCheckboxGroup>
          <UPChoose
            modelValue={chooseIndex}
            options={[{ title: 'Daily' }, { title: 'Weekly' }, { title: 'Monthly' }]}
            onUpdateModelValue={setChooseIndex}
          />
          <Text>Selected chooser index: {chooseIndex}</Text>
          <Text style={styles.section}>Picker Family</Text>
          <UPButton text="Choose color and size" onClick={() => setPickerOpen(true)} />
          <UPPicker
            columns={[
              [{ text: 'Red', value: 'red' }, { text: 'Blue', value: 'blue' }],
              ['Small', 'Large'],
            ]}
            modelValue={pickerValue}
            onChangeShow={setPickerOpen}
            onUpdateModelValue={setPickerValue}
            show={pickerOpen}
            title="Product options"
          />
          <Text>Picker: {pickerValue.join(' / ')}</Text>
          <UPPickerData
            modelValue={pickerDataValue}
            onUpdateModelValue={(value) => {
              if (value !== undefined) setPickerDataValue(value);
            }}
            options={[{ id: 0, name: 'No city' }, { id: 1, name: 'Amsterdam' }, { id: 2, name: 'Berlin' }]}
            title="City data"
          />
          <Text>Picker data: {pickerDataValue}</Text>
          <Text style={styles.section}>Selector Extensions</Text>
          <UPButton text="Choose delivery time" onClick={() => setDatetimeOpen(true)} />
          <UPDatetimePicker
            mode="datetime"
            modelValue={datetimeValue}
            onChangeShow={setDatetimeOpen}
            onUpdateModelValue={(value) => {
              if (typeof value === 'number') setDatetimeValue(value);
            }}
            show={datetimeOpen}
            title="Delivery time"
          />
          <Text>Datetime: {new Date(datetimeValue).toLocaleString()}</Text>
          <UPButton text="Choose delivery area" onClick={() => setCascaderOpen(true)} />
          <UPCascader
            data={demoCascaderData}
            modelValue={cascaderValue}
            onChangeShow={setCascaderOpen}
            onUpdateModelValue={setCascaderValue}
            show={cascaderOpen}
          />
          <Text>Cascader: {cascaderValue.join(' / ') || 'not selected'}</Text>
          <UPCityLocate
            currentCity={locatedCity}
            locate={async () => ({ locationCity: '杭州' })}
            onLocationSuccess={({ locationCity }) => setLocatedCity(locationCity)}
            onSelectCity={({ locationCity }) => setLocatedCity(locationCity)}
          />
          <Text style={styles.section}>Navigation and Category Tabs</Text>
          <UPNavbar
            border
            leftText="返回"
            onLeftClick={() => setNavigationEvent('navbar:left')}
            onRightClick={() => setNavigationEvent('navbar:right')}
            rightText="帮助"
            title="P28 导航栏"
          />
          <UPNavbarMini
            autoBack={false}
            fixed={false}
            homeUrl="/pages/index/index"
            onHomeClick={({ homeUrl }) => setNavigationEvent(`navbar-mini:home:${homeUrl}`)}
            onLeftClick={() => setNavigationEvent('navbar-mini:left')}
          />
          <Text>Navigation event: {navigationEvent}</Text>
          <UPCateTab
            current={cateCurrent}
            height={360}
            onUpdateCurrent={setCateCurrent}
            tabList={demoCategoryTabs}
          />
          <UPCateTab
            current={cateCurrent}
            height={260}
            mode="tab"
            onUpdateCurrent={setCateCurrent}
            tabList={demoCategoryTabs}
          />
          <Text style={styles.section}>Canvas and Code Images</Text>
          <UPCanvas canvasId="demo-canvas" width={160} height={80} bgColor="#f5f7fa" />
          <UPQrcode val="https://uview-plus.jiangruyi.com" size={140} />
          <UPBarcode value="ABC123456" width={220} height={80} />
          <Text style={styles.section}>Calendar Family</Text>
          <UPButton text="Choose delivery date" onClick={() => setCalendarOpen(true)} />
          <UPCalendar
            defaultDate="2024-05-10"
            enableTime
            maxDate="2024-06-30"
            minDate="2024-05-01"
            onChangeShow={setCalendarOpen}
            onConfirm={(dates) => setCalendarValue(dates.join(' / '))}
            show={calendarOpen}
            timePrecision="minute"
          />
          <Text>Calendar: {calendarValue || 'not selected'}</Text>
          <UPCalendarStrip
            fullCalendar
            maxDate="2024-06-30"
            minDate="2024-05-01"
            modelValue={calendarStripDate}
            onUpdateModelValue={setCalendarStripDate}
          />
          <Text>Calendar strip: {calendarStripDate}</Text>
          <UPSelect
            current={selectValue}
            onUpdateCurrent={(value) => {
              if (value !== undefined) setSelectValue(value);
            }}
            options={[{ id: 'first', name: 'First delivery' }, { id: 'second', name: 'Second delivery' }]}
            showOptionsLabel
          />
          <Text>Select: {selectValue}</Text>
          <Text style={styles.section}>Dropdown</Text>
          <UPDropdown>
            <UPDropdownItem
              modelValue={delivery}
              onUpdateModelValue={(value) => {
                if (typeof value === 'string' || typeof value === 'number') setDelivery(value);
              }}
              options={[
                { label: 'Standard delivery', value: 'standard' },
                { label: 'Express delivery', value: 'express' },
              ]}
              title="Delivery"
            />
          </UPDropdown>
          <Text>Delivery: {delivery}</Text>
          <Text style={styles.section}>Tooltip and Popover</Text>
          <UPTooltip
            buttons={['Archive']}
            onClick={(index) => setTooltipAction(index === 0 ? 'Archived' : 'Copied')}
            showCopy={false}
            text="Actions"
            triggerMode="click"
          />
          <Text>Tooltip action: {tooltipAction}</Text>
          <UPButton text="Open number keyboard" onClick={() => setKeyboardOpen(true)} />
          <UPKeyboard
            onBackspace={() => setKeyboardValue((value) => value.slice(0, -1))}
            onChange={(value) => setKeyboardValue((current) => `${current}${value}`)}
            onChangeShow={setKeyboardOpen}
            onConfirm={() => setKeyboardOpen(false)}
            show={keyboardOpen}
            tips="Enter amount"
          />
          <Text>Keyboard value: {keyboardValue || '—'}</Text>
          <UPRadioGroup value={shipping} onChange={setShipping}>
            <UPRadio label="Standard" name="standard" />
            <UPRadio label="Express" name="express" />
          </UPRadioGroup>
          <UPNumberBox max={9} min={1} value={quantity} onChange={(value) => setQuantity(value)} />
          <UPCodeInput maxlength={4} value={code} onChange={setCode} />
          <UPButton text={codePrompt} onClick={() => codeRef.current?.start()} />
          <UPCode
            changeText="X秒后重新获取"
            endText="重新获取验证码"
            onChange={setCodePrompt}
            ref={codeRef}
            seconds={10}
            startText="获取验证码"
          />
          <Text>Query: {query || '—'} · Quantity: {quantity} · Code: {code || '—'} · Code prompt: {codePrompt}</Text>
          <Text style={styles.section}>Form Validation</Text>
          <UPForm ref={formRef} model={profile} rules={{ email: { required: true, message: 'Email is required' } }}>
            <UPFormItem label="Email" prop="email" required>
              <UPInput placeholder="Required on submit" value={profile.email} onChange={(email) => setProfile({ email })} />
            </UPFormItem>
          </UPForm>
          <UPButton text="Validate form" onClick={() => {
            formRef.current?.validate()
              .then(() => setFormStatus('Profile is valid'))
              .catch(() => setFormStatus('Please correct the form'));
          }} />
          {formStatus ? <Text>{formStatus}</Text> : null}
          <Text style={styles.section}>Feedback and Overlays</Text>
          <View style={styles.row}>
            <UPButton text="Toast" onClick={() => UP.toast.success('Saved')} />
            <UPButton text="Notify" type="warning" onClick={() => UP.notify.warning('Network is slow')} />
            <UPButton text="Popup" type="primary" onClick={() => setPopupOpen(true)} />
            <UPButton text="Modal" onClick={() => setModalOpen(true)} />
            <UPButton text="Actions" onClick={() => setSheetOpen(true)} />
            <UPButton text={loading ? 'Stop loading' : 'Load page'} type="success" onClick={() => setLoading((value) => !value)} />
          </View>
          <UPNotify duration={0} message="Declarative notify" show />
          <UPPopup show={popupOpen} onChangeShow={setPopupOpen} closeable>
            <View style={styles.popupContent}>
              <UPText text="Popup content renders through UPRoot." />
            </View>
          </UPPopup>
          <UPModal
            content="This source-compatible modal is controlled by show."
            onChangeShow={setModalOpen}
            onConfirm={() => UP.toast.success('Confirmed')}
            show={modalOpen}
            showCancelButton
            title="Confirm action"
          />
          <UPActionSheet
            actions={[{ name: 'Share' }, { name: 'Archive' }]}
            cancelText="Cancel"
            onChangeShow={setSheetOpen}
            onSelect={(action) => UP.toast.primary(String(action.name))}
            show={sheetOpen}
          />
          <UPLoadingPage loading={loading} loadingText="Fetching source data" />
          <Text style={styles.section}>Progress and Status</Text>
          <UPLineProgress percentage={progress} />
          <View style={styles.row}>
            <UPCircleProgress percentage={progress} />
            <UPCountDown format="mm:ss" time={75_000} />
            <UPCountTo decimals={1} duration={800} endVal={1234.5} separator="," />
          </View>
          <View style={styles.row}>
            <UPButton text="Advance progress" onClick={() => setProgress((value) => Math.min(100, value + 15))} />
            <UPButton text="No more" plain onClick={() => setLoadStatus('nomore')} />
          </View>
          <UPLoadmore
            onLoadmore={() => setLoadStatus('loading')}
            status={loadStatus}
          />
        </UPScrollHost>
        <UPTabbar fixed={false} onChange={setActiveTab} value={activeTab}>
          <UPTabbarItem activeIcon="home-fill" icon="home" name="home" text="Home" />
          <UPTabbarItem badge={2} icon="star" name="favorites" text="Favorites" />
          <UPTabbarItem icon="plus" mode="midButton" name="create" text="Create" />
        </UPTabbar>
        <Text>Active tab: {activeTab}</Text>
        <UPSafeBottom />
        <UPNoNetwork connected={connected} onRetry={() => setConnected(true)} />
        <UPFloatButton
          isMenu
          list={[{ name: 'edit' }, { name: 'share' }]}
          onItemClick={(item) => UP.toast.default(`Action: ${item.name}`)}
        />
      </View>
    </UPRoot>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 16,
  },
  page: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginRight: 8,
    padding: 16,
    width: 130,
  },
  popupContent: {
    padding: 24,
  },
  section: {
    color: '#606266',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#303133',
    fontSize: 22,
    fontWeight: '700',
  },
  titleText: {
    color: '#303133',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default App;
