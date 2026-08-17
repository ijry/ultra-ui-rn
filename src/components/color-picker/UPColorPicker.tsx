import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { clamp, hexToHsv, hsvToHex, type HSVColor } from './color';
import { UPPopup } from '../popup';

export type UPColorPickerGradientDirection = 'to right' | 'to bottom' | 'to bottom right' | 'to bottom left';

export type UPColorPickerProps = {
  modelValue?: string;
  /** RN binding alias: source `modelValue` maps to `value`. */
  value?: string;
  defaultValue?: string;
  commonColors?: readonly string[];
  show?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (color: string) => void;
  /** Source `input` event: fires on every value change (same timing as `onChange`). */
  onInput?: (color: string) => void;
  /** Source `confirm` event: fires with the final color on confirm. */
  onConfirm?: (color: string) => void;
  /** Source `close` event: fires when the picker closes. */
  onClose?: () => void;
};

const DIRECTION_LABELS: Record<UPColorPickerGradientDirection, string> = {
  'to right': '从左到右',
  'to bottom': '从上到下',
  'to bottom right': '从左上到右下',
  'to bottom left': '从右上到左下',
};

const PANEL_WIDTH = 280;
const PANEL_HEIGHT = 180;

function makeResponder(onMove: (x: number, y: number) => void) {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      onMove(locationX, locationY);
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      onMove(locationX, locationY);
    },
  });
}

export function UPColorPicker(input: UPColorPickerProps): React.JSX.Element {
  const props = { ...useUPConfig().props.colorPicker, ...input } as UPColorPickerProps;
  const external = input.value ?? input.modelValue;
  const initial = external ?? input.defaultValue ?? props.modelValue ?? '#ff0000';
  const [show, setShow] = useState(Boolean(input.show ?? props.show));
  const [tab, setTab] = useState(0);
  const [solid, setSolid] = useState<HSVColor>(() => hexToHsv(String(initial)));
  const [direction, setDirection] = useState<UPColorPickerGradientDirection>('to right');
  const [gradientFrom, setGradientFrom] = useState('#ff0000');
  const panelRef = useRef<View>(null);

  useEffect(() => {
    if (input.show !== undefined) setShow(input.show);
  }, [input.show]);

  useEffect(() => {
    if (external !== undefined && external !== null) setSolid(hexToHsv(String(external)));
  }, [external]);

  const currentHex = hsvToHex(solid);

  const emitValue = (color: string) => {
    input.onChange?.(color);
    input.onInput?.(color);
  };

  const confirm = () => {
    const color = tab === 0 ? currentHex : gradientFrom;
    emitValue(color);
    setShow(false);
    input.onConfirm?.(color);
    input.onClose?.();
  };

  const close = () => {
    setShow(false);
    input.onClose?.();
  };

  const selectCommon = (color: string) => {
    if (tab === 0) {
      setSolid(hexToHsv(color));
      emitValue(color);
    } else {
      setGradientFrom(color);
      emitValue(color);
    }
  };

  const hueResponder = makeResponder((x) => {
    const next = { ...solid, hue: Math.round(clamp((x / PANEL_WIDTH) * 360, 0, 360)) };
    setSolid(next);
    emitValue(hsvToHex(next));
  });

  const alphaResponder = makeResponder((x) => {
    const next = { ...solid, alpha: clamp(x / PANEL_WIDTH, 0, 1) };
    setSolid(next);
  });

  const svResponder = makeResponder((x, y) => {
    const next = {
      ...solid,
      saturation: Math.round(clamp((x / PANEL_WIDTH) * 100, 0, 100)),
      lightness: Math.round(clamp(100 - (y / PANEL_HEIGHT) * 100, 0, 100)),
    };
    setSolid(next);
    emitValue(hsvToHex(next));
  });

  return (
    <View style={input.customStyle} testID="up-color-picker">
      <Pressable onPress={() => setShow(true)} testID="up-color-picker-trigger">
        <View
          style={{
            backgroundColor: currentHex,
            borderColor: '#dcdfe6',
            borderRadius: 4,
            borderWidth: 1,
            height: 36,
            width: 64,
          }}
        />
      </Pressable>
      <UPPopup mode="center" onChangeShow={(next) => setShow(next)} onClose={input.onClose} show={show}>
        <View style={{ padding: 16, width: PANEL_WIDTH + 32 }}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {['纯色', '渐变'].map((label, index) => (
              <Pressable
                key={label}
                onPress={() => setTab(index)}
                style={{
                  borderBottomColor: tab === index ? '#2979ff' : 'transparent',
                  borderBottomWidth: 2,
                  marginRight: 20,
                  paddingBottom: 4,
                }}
                testID={`up-color-picker-tab-${index}`}
              >
                <Text style={{ color: tab === index ? '#2979ff' : '#606266', fontSize: 15 }}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 0 ? (
            <View>
              {/* Saturation / Lightness panel */}
              <View
                {...svResponder.panHandlers}
                ref={panelRef}
                style={{
                  backgroundColor: hsvToHex({ ...solid, saturation: 100, lightness: 50 }),
                  borderRadius: 6,
                  height: PANEL_HEIGHT,
                  overflow: 'hidden',
                  position: 'relative',
                  width: PANEL_WIDTH,
                }}
                testID="up-color-picker-sv-panel"
              >
                {/* Vertical white-to-transparent overlay (lightness), horizontal transparent-to-black (saturation). */}
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    bottom: 0,
                    left: 0,
                    position: 'absolute',
                    right: 0,
                    top: PANEL_HEIGHT / 2,
                  }}
                />
                <View
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    bottom: 0,
                    left: 0,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                  }}
                />
                <View
                  style={{
                    borderColor: '#ffffff',
                    borderRadius: 7,
                    borderWidth: 2,
                    height: 14,
                    left: (solid.saturation / 100) * PANEL_WIDTH - 7,
                    position: 'absolute',
                    top: (1 - solid.lightness / 100) * PANEL_HEIGHT - 7,
                    width: 14,
                  }}
                  testID="up-color-picker-sv-dot"
                />
              </View>

              {/* Hue bar */}
              <View {...hueResponder.panHandlers} style={{ height: 16, marginTop: 12, position: 'relative' }} testID="up-color-picker-hue">
                {Array.from({ length: 6 }, (_, index) => {
                  const h = index * 60;
                  return (
                    <View
                      key={h}
                      style={{
                        backgroundColor: hsvToHex({ hue: h, saturation: 100, lightness: 50, alpha: 1 }),
                        height: 16,
                        left: (h / 360) * PANEL_WIDTH,
                        position: 'absolute',
                        width: PANEL_WIDTH / 6 + 1,
                      }}
                    />
                  );
                })}
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#909399',
                    borderRadius: 7,
                    borderWidth: 2,
                    height: 14,
                    left: (solid.hue / 360) * PANEL_WIDTH - 7,
                    position: 'absolute',
                    top: 1,
                    width: 14,
                  }}
                />
              </View>

              {/* Alpha bar */}
              <View {...alphaResponder.panHandlers} style={{ height: 16, marginTop: 12, position: 'relative' }} testID="up-color-picker-alpha">
                <View
                  style={{
                    backgroundColor: `rgba(${parseInt(currentHex.slice(1, 3), 16)},${parseInt(currentHex.slice(3, 5), 16)},${parseInt(currentHex.slice(5, 7), 16)},1)`,
                    borderRadius: 8,
                    height: 16,
                    width: PANEL_WIDTH,
                  }}
                />
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#909399',
                    borderRadius: 7,
                    borderWidth: 2,
                    height: 14,
                    left: solid.alpha * PANEL_WIDTH - 7,
                    position: 'absolute',
                    top: 1,
                    width: 14,
                  }}
                />
              </View>
            </View>
          ) : (
            <View testID="up-color-picker-gradient">
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {(['to right', 'to bottom', 'to bottom right', 'to bottom left'] as const).map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDirection(d)}
                    style={{
                      backgroundColor: direction === d ? '#2979ff' : '#f2f3f5',
                      borderRadius: 4,
                      marginRight: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                    testID={`up-color-picker-direction-${d}`}
                  >
                    <Text style={{ color: direction === d ? '#ffffff' : '#606266', fontSize: 12 }}>{DIRECTION_LABELS[d]}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: gradientFrom,
                    borderColor: '#dcdfe6',
                    borderRadius: 4,
                    borderWidth: 1,
                    height: 32,
                    width: 48,
                  }}
                />
                <Text style={{ color: '#606266', fontSize: 14, marginHorizontal: 8 }}>→</Text>
                <View
                  style={{
                    backgroundColor: gradientFrom,
                    borderColor: '#dcdfe6',
                    borderRadius: 4,
                    borderWidth: 1,
                    height: 32,
                    width: 48,
                  }}
                />
              </View>
            </View>
          )}

          {props.commonColors && props.commonColors.length > 0 ? (
            <View style={{ marginTop: 12 }} testID="up-color-picker-common">
              <Text style={{ color: '#606266', fontSize: 13, marginBottom: 8 }}>常用颜色</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {props.commonColors.map((color, index) => (
                  <Pressable
                    key={`${color}-${index}`}
                    onPress={() => selectCommon(color)}
                    style={{
                      backgroundColor: color,
                      borderColor: '#dcdfe6',
                      borderRadius: 12,
                      borderWidth: 1,
                      height: 24,
                      marginRight: 8,
                      marginBottom: 8,
                      width: 24,
                    }}
                    testID={`up-color-picker-common-${index}`}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 }}>
            <Pressable onPress={close} style={{ paddingHorizontal: 16, paddingVertical: 8 }} testID="up-color-picker-close">
              <Text style={{ color: '#909399', fontSize: 15 }}>取消</Text>
            </Pressable>
            <Pressable
              onPress={confirm}
              style={{ backgroundColor: '#2979ff', borderRadius: 4, paddingHorizontal: 20, paddingVertical: 8 }}
              testID="up-color-picker-confirm"
            >
              <Text style={{ color: '#ffffff', fontSize: 15 }}>确定</Text>
            </Pressable>
          </View>
        </View>
      </UPPopup>
    </View>
  );
}
