import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPPosterView = {
  type?: 'text' | 'image' | 'qrcode' | 'view';
  text?: string;
  src?: string;
  url?: string;
  css?: Record<string, unknown> & {
    left?: UPDimension;
    top?: UPDimension;
    width?: UPDimension;
    height?: UPDimension;
    fontSize?: UPDimension;
    color?: string;
    fontWeight?: string | number;
    lineHeight?: UPDimension;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    borderRadius?: UPDimension;
  };
};

export type UPPosterJson = {
  css?: UPPosterView['css'];
  views?: readonly UPPosterView[];
};

export type UPPosterExportResult = {
  path: string | null;
  width: number;
  height: number;
};

export type UPPosterHandle = {
  /** Source `exportImage()`: exports the poster as a temp image.
   *  React Native boundary: returns `{ path: null, ... }` unless an adapter is injected. */
  exportImage: () => Promise<UPPosterExportResult>;
};

export type UPPosterProps = {
  json?: UPPosterJson;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Native export boundary: inject `exportImageAdapter` (e.g. react-native-view-shot) to produce a real image. */
  exportImageAdapter?: (json: UPPosterJson, layout: { width: number; height: number }) => Promise<UPPosterExportResult>;
};

function dim(value: UPDimension | undefined, fallback: number): number {
  return value === undefined || value === '' ? fallback : getPx(value);
}

export const UPPoster = forwardRef<UPPosterHandle, UPPosterProps>(function UPPoster(input, ref) {
  const props = { ...useUPConfig().props.poster, ...input } as UPPosterProps;
  const json = props.json ?? {};
  const containerCss = json.css ?? {};
  const width = dim(containerCss.width, 300);
  const height = dim(containerCss.height, 500);
  const views = json.views ?? [];

  useImperativeHandle(ref, () => ({
    exportImage: async () => {
      if (props.exportImageAdapter) {
        return props.exportImageAdapter(json, { width, height });
      }
      return { path: null, width, height };
    },
  }));

  const rendered = useMemo(
    () =>
      views.map((view, index) => {
        const css = view.css ?? {};
        const left = dim(css.left, 0);
        const top = dim(css.top, 0);
        const viewWidth = dim(css.width, 100);
        const viewHeight = dim(css.height, 40);
        const position = { left, position: 'absolute' as const, top };
        switch (view.type) {
          case 'image':
            return view.src || view.url ? (
              <Image
                key={index}
                source={{ uri: view.src ?? view.url }}
                style={[
                  position,
                  { borderRadius: dim(css.borderRadius, 0), height: viewHeight, width: viewWidth },
                ]}
                testID={`up-poster-image-${index}`}
              />
            ) : null;
          case 'text':
            return (
              <View key={index} style={{ ...position, width: viewWidth }}>
                <Text
                  style={{
                    color: css.color ?? '#303133',
                    fontSize: dim(css.fontSize, 14),
                    fontWeight: (css.fontWeight ?? '400') as '400',
                    lineHeight: dim(css.lineHeight, 18),
                    textAlign: css.textAlign ?? 'left',
                  }}
                  testID={`up-poster-text-${index}`}
                >
                  {view.text ?? ''}
                </Text>
              </View>
            );
          case 'qrcode':
            return (
              <View
                key={index}
                style={{
                  ...position,
                  alignItems: 'center',
                  backgroundColor: '#f2f3f5',
                  borderRadius: dim(css.borderRadius, 0),
                  height: viewHeight,
                  justifyContent: 'center',
                  width: viewWidth,
                }}
                testID={`up-poster-qrcode-${index}`}
              >
                <Text style={{ color: '#909399', fontSize: 11 }}>QR</Text>
              </View>
            );
          default:
            return (
              <View
                key={index}
                style={{
                  ...position,
                  backgroundColor: css.backgroundColor ?? 'transparent',
                  borderRadius: dim(css.borderRadius, 0),
                  height: viewHeight,
                  width: viewWidth,
                }}
                testID={`up-poster-view-${index}`}
              />
            );
        }
      }),
    [json, width, height],
  );

  return (
    <View
      style={[
        {
          backgroundColor: containerCss.backgroundColor ?? '#ffffff',
          height,
          overflow: 'hidden',
          position: 'relative',
          width,
        },
        input.customStyle,
      ]}
      testID="up-poster"
    >
      {rendered}
    </View>
  );
});
