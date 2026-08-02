import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPImage, type UPImageProps } from '../image';

export type UPLazyLoadViewport = {
  height: number;
  width: number;
};

export type UPLazyLoadProps = {
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  error?: UPImageProps['error'];
  height?: UPDimension;
  mode?: string;
  once?: boolean;
  placeholder?: React.ReactNode;
  renderContent?: () => React.ReactNode;
  scrollOffset?: number;
  src?: string;
  threshold?: number;
  viewport?: UPLazyLoadViewport;
  visible?: boolean;
  width?: UPDimension;
  onError?: UPImageProps['onError'];
  onLoad?: UPImageProps['onLoad'];
  onVisible?: () => void;
};

type ResolvedUPLazyLoadProps = UPLazyLoadProps & Required<Pick<
  UPLazyLoadProps,
  'height' | 'mode' | 'once' | 'threshold' | 'width'
>>;

function resolveSize(value: UPDimension): ViewStyle['width'] {
  return String(value).includes('%')
    ? (String(value) as `${number}%`)
    : getPx(value);
}

function computeVisible(options: {
  layoutY?: number;
  scrollOffset?: number;
  threshold: number;
  viewport?: UPLazyLoadViewport;
}): boolean {
  if (!options.viewport || options.layoutY === undefined) return false;
  const top = options.layoutY - (options.scrollOffset ?? 0);
  return top <= options.viewport.height + options.threshold;
}

export function UPLazyLoad(input: UPLazyLoadProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.lazyLoad, ...input } as ResolvedUPLazyLoadProps;
  const visibleRef = useRef(false);
  const [layoutY, setLayoutY] = useState<number | undefined>(undefined);
  const derivedVisible = input.visible ?? computeVisible({
    layoutY,
    scrollOffset: props.scrollOffset,
    threshold: Number(props.threshold),
    viewport: props.viewport,
  });
  const [hasMountedContent, setHasMountedContent] = useState(Boolean(derivedVisible));
  const shouldRenderContent = Boolean(derivedVisible || (props.once && hasMountedContent));

  useEffect(() => {
    if (derivedVisible && !visibleRef.current) {
      input.onVisible?.();
    }
    visibleRef.current = Boolean(derivedVisible);
    if (derivedVisible) setHasMountedContent(true);
  }, [derivedVisible, input]);

  const onLayout = (event: LayoutChangeEvent) => {
    setLayoutY(event.nativeEvent.layout.y);
  };

  const frameStyle = useMemo<ViewStyle>(() => ({
    height: resolveSize(props.height),
    overflow: 'hidden',
    width: resolveSize(props.width),
  }), [props.height, props.width]);

  const content = shouldRenderContent ? (
    <View testID="up-lazy-load-content">
      {props.renderContent ? props.renderContent() : (
        <UPImage
          error={props.error}
          height={props.height}
          mode={props.mode}
          src={props.src}
          width={props.width}
          onError={props.onError}
          onLoad={props.onLoad}
        />
      )}
    </View>
  ) : (
    props.placeholder ?? <View style={{ backgroundColor: '#f3f4f6', flex: 1 }} testID="up-lazy-load-placeholder" />
  );

  return (
    <View onLayout={onLayout} style={[frameStyle, input.customStyle]} testID="up-lazy-load">
      {content}
    </View>
  );
}
