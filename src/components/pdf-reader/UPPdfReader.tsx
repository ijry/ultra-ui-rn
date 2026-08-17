import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils';

export type UPPdfReaderProps = {
  src?: string;
  height?: string;
  baseUrl?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** PDF rendering is a React Native boundary: inject `renderPdf` to provide
   *  react-native-pdf / WebView rendering. Falls back to a placeholder. */
  renderPdf?: (payload: { src: string; height: number }) => React.ReactNode;
};

export function UPPdfReader(input: UPPdfReaderProps): React.JSX.Element {
  const props = { ...useUPConfig().props.pdfReader, ...input } as UPPdfReaderProps;
  const height = getPx(props.height ?? '500px');
  const src = props.src ?? '';

  return (
    <View style={[{ height }, input.customStyle]} testID="up-pdf-reader">
      {props.renderPdf ? (
        props.renderPdf({ src, height })
      ) : src ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#f7f8fa',
            borderColor: '#e4e7ed',
            borderRadius: 8,
            borderWidth: 1,
            flex: 1,
            justifyContent: 'center',
          }}
          testID="up-pdf-reader-placeholder"
        >
          <Text style={{ color: '#606266', fontSize: 15 }}>PDF: {src}</Text>
          <Text style={{ color: '#909399', fontSize: 13, marginTop: 8 }}>
            React Native 需注入 renderPdf（react-native-pdf / WebView）
          </Text>
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#f7f8fa',
            borderRadius: 8,
            flex: 1,
            justifyContent: 'center',
          }}
          testID="up-pdf-reader-placeholder"
        >
          <Text style={{ color: '#909399', fontSize: 13 }}>未提供 src</Text>
        </View>
      )}
    </View>
  );
}
