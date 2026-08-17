import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPOverlay } from '../../overlay';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { UPOverlay } from '../overlay';

export type UPSelectOption = Record<string, unknown>;

export type UPSelectProps = {
  maxHeight?: UPDimension;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayStyle?: StyleProp<ViewStyle>;
  /** @deprecated Root-overlay menus update immediately instead of CSS transitions. */
  duration?: UPDimension;
  label?: string;
  options?: readonly UPSelectOption[];
  keyName?: string;
  labelName?: string;
  showOptionsLabel?: boolean;
  current?: string | number;
  zIndex?: number;
  itemColor?: string;
  iconColor?: string;
  iconSize?: UPDimension;
  disabled?: boolean;
  border?: boolean;
  optionsWidth?: UPDimension;
  renderText?: (currentLabel: string) => React.ReactNode;
  icon?: React.ReactNode;
  renderOptions?: () => React.ReactNode;
  renderOption?: (item: UPSelectOption, index: number) => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onSelect?: (item: UPSelectOption) => void;
  onUpdateCurrent?: (current: string | number | undefined) => void;
};

type SelectFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const fallbackFrame: SelectFrame = { height: 0, width: 100, x: 0, y: 0 };
let selectSequence = 0;

function maxMenuHeight(value: UPDimension | undefined): number {
  const text = String(value ?? '90vh').trim();
  if (text.endsWith('vh')) {
    const viewportPercent = Number.parseFloat(text);
    return Number.isFinite(viewportPercent)
      ? (Dimensions.get('window').height * viewportPercent) / 100
      : Dimensions.get('window').height * 0.9;
  }
  return getPx(text);
}

function menuWidth(value: UPDimension | undefined, triggerWidth: number): number {
  if (value === undefined || value === '') return Math.max(100, triggerWidth);
  const text = String(value).trim();
  if (text.endsWith('%')) {
    const percentage = Number.parseFloat(text);
    return Number.isFinite(percentage) ? (triggerWidth * percentage) / 100 : Math.max(100, triggerWidth);
  }
  return getPx(text);
}

type SelectLayerProps = {
  props: Required<Pick<UPSelectProps,
    'current' | 'keyName' | 'labelName' | 'maxHeight' | 'options' | 'overlay' | 'overlayOpacity' | 'zIndex'>> & UPSelectProps;
  frame: SelectFrame;
  close: () => void;
  select: (item: UPSelectOption) => void;
};

function SelectLayer({ props, frame, close, select }: SelectLayerProps): React.JSX.Element {
  const width = menuWidth(props.optionsWidth, frame.width);
  const windowWidth = Dimensions.get('window').width;
  const left = Math.max(0, Math.min(frame.x, Math.max(0, windowWidth - width)));
  const top = frame.y + frame.height + 4;
  const keyName = props.keyName;
  const labelName = props.labelName;
  const options = props.options;
  const rows = props.renderOptions?.() ?? options.map((item, index) => {
    const selected = props.current === item[keyName];
    return (
      <Pressable
        accessibilityRole="button"
        key={`${String(item[keyName] ?? index)}-${index}`}
        onPress={() => select(item)}
        style={{
          backgroundColor: selected ? '#f7f7f7' : '#ffffff',
          minHeight: 40,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
        testID={`up-select-option-${index}`}
      >
        {props.renderOption?.(item, index) ?? (
          <Text style={{ color: props.itemColor || '#303133', fontSize: 14 }}>
            {String(item[labelName] ?? '')}
          </Text>
        )}
      </Pressable>
    );
  });

  return (
    <View pointerEvents="box-none" style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}>
      {props.overlay ? (
        <UPOverlay
          customStyle={props.overlayStyle}
          onClick={close}
          opacity={props.overlayOpacity}
          show
          testID="up-select-overlay"
          zIndex={props.zIndex}
        />
      ) : null}
      <ScrollView
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#f1f1f1',
          borderRadius: 4,
          borderWidth: 1,
          left,
          maxHeight: maxMenuHeight(props.maxHeight),
          position: 'absolute',
          top,
          width,
          zIndex: props.zIndex + 1,
        }}
        testID="up-select-menu"
      >
        {rows}
      </ScrollView>
    </View>
  );
}

export function UPSelect(input: UPSelectProps): React.JSX.Element {
  const props = {
    border: false,
    current: '',
    disabled: false,
    duration: 300,
    iconColor: '',
    iconSize: '13px',
    itemColor: '',
    keyName: 'id',
    label: '选项',
    labelName: 'name',
    maxHeight: '90vh',
    options: [] as readonly UPSelectOption[],
    optionsWidth: '',
    overlay: true,
    overlayOpacity: 0.01,
    showOptionsLabel: false,
    zIndex: 11000,
    ...input,
  };
  const overlay = useUPOverlay();
  const triggerRef = useRef<View>(null);
  const id = useRef(`up-select-${selectSequence++}`).current;
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState<SelectFrame>(fallbackFrame);
  const currentOption = useMemo(
    () => props.options.find((item) => item[props.keyName] === props.current),
    [props.current, props.keyName, props.options],
  );
  const currentLabel = currentOption === undefined ? '' : String(currentOption[props.labelName] ?? '');
  const close = useCallback(() => setOpen(false), []);
  const select = useCallback((item: UPSelectOption) => {
    close();
    input.onUpdateCurrent?.(item[props.keyName] as string | number | undefined);
    input.onSelect?.(item);
  }, [close, input, props.keyName]);

  const layerProps = useMemo(() => props, [props]);

  useEffect(() => {
    if (!open) {
      overlay.remove(id);
      return;
    }
    overlay.add({
      id,
      node: <SelectLayer close={close} frame={frame} props={layerProps} select={select} />,
      zIndex: props.zIndex,
    });
    return () => overlay.remove(id);
  }, [close, frame, id, layerProps, open, overlay, props.zIndex, select]);

  const openMenu = () => {
    if (props.disabled) return;
    setFrame(fallbackFrame);
    setOpen(true);
    const node = triggerRef.current;
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x, y, width, height) => {
        setFrame({ height, width, x, y });
      });
    }
  };

  const label = props.showOptionsLabel ? currentLabel : props.label;
  const text = input.renderText?.(currentLabel) ?? <Text style={{ color: '#303133', flex: 1, fontSize: 14 }}>{label}</Text>;
  const icon = input.icon ?? <UPIcon color={props.iconColor || '#606266'} name="arrow-down" size={props.iconSize} />;

  return (
    <View ref={triggerRef} style={input.customStyle} testID="up-select">
      <Pressable
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={openMenu}
        style={{
          alignItems: 'center',
          borderColor: props.border ? '#dadbde' : 'transparent',
          borderRadius: 4,
          borderWidth: props.border ? 1 : 0,
          flexDirection: 'row',
          minHeight: props.border ? 36 : undefined,
          opacity: props.disabled ? 0.6 : 1,
          paddingHorizontal: props.border ? 10 : 0,
          paddingVertical: props.border ? 8 : 0,
        }}
        testID="up-select-trigger"
      >
        {text}
        {icon}
      </Pressable>
    </View>
  );
}
