import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
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
  borderRadius?: UPDimension;
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  error?: UPImageProps['error'];
  errorImg?: string;
  height?: UPDimension;
  image?: string;
  imgMode?: string;
  index?: string | number;
  loadingImg?: string;
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
  onClick?: (index?: string | number) => void;
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
  const src = input.src ?? props.image;
  const mode = input.mode ?? props.imgMode ?? props.mode;
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
    borderRadius: input.borderRadius !== undefined ? getPx(input.borderRadius) : undefined,
    height: resolveSize(props.height),
    overflow: 'hidden',
    width: resolveSize(props.width),
  }), [input.borderRadius, props.height, props.width]);

  const content = shouldRenderContent ? (
    <Pressable onPress={() => input.onClick?.(props.index)} testID="up-lazy-load-content">
      {props.renderContent ? props.renderContent() : (
        <UPImage
          error={props.errorImg ? <UPImage height={props.height} mode={mode} src={props.errorImg} width={props.width} /> : props.error}
          height={props.height}
          mode={mode}
          src={src}
          width={props.width}
          onError={props.onError}
          onLoad={props.onLoad}
        />
      )}
    </Pressable>
  ) : (
    props.placeholder ?? (
      props.loadingImg ? (
        <UPImage height={props.height} mode={mode} src={props.loadingImg} width={props.width} />
      ) : (
        <View style={{ backgroundColor: '#f3f4f6', flex: 1 }} testID="up-lazy-load-placeholder" />
      )
    )
  );

  return (
    <View onLayout={onLayout} style={[frameStyle, input.customStyle]} testID="up-lazy-load">
      {content}
    </View>
  );
}
