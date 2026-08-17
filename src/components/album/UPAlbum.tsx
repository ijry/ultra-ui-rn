import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPImage } from '../image';

export type UPAlbumItem = string | Record<string, unknown>;

export type UPAlbumPreviewEvent = {
  urls: string[];
  currentIndex: number;
};

export type UPAlbumProps = {
  urls?: readonly UPAlbumItem[];
  keyName?: string;
  singleSize?: UPDimension;
  multipleSize?: UPDimension;
  space?: UPDimension;
  singleMode?: string;
  multipleMode?: string;
  maxCount?: number | string;
  previewFullImage?: boolean;
  rowCount?: number | string;
  showMore?: boolean;
  shape?: 'circle' | 'square';
  radius?: UPDimension;
  autoWrap?: boolean;
  /** @deprecated Only pixel-like values can map to React Native dimensions. */
  unit?: string;
  stop?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onPreview?: (event: UPAlbumPreviewEvent) => void;
  onAlbumWidth?: (width: number) => void;
};

type AlbumEntry = {
  source: string;
  index: number;
};

function resolveSource(item: UPAlbumItem, keyName: string): string {
  if (typeof item === 'string') {
    return item;
  }

  const keyed = keyName ? item[keyName] : undefined;
  if (typeof keyed === 'string' && keyed) {
    return keyed;
  }
  return typeof item.src === 'string' ? item.src : '';
}

function positiveInteger(value: number | string | undefined, fallback: number): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.floor(numberValue) : fallback;
}

function nonNegativePx(value: UPDimension | undefined, fallback: number): number {
  return Math.max(0, getPx(value ?? fallback));
}

export function UPAlbum(input: UPAlbumProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.album, ...input } as UPAlbumProps;
  const sourceItems = props.urls ?? [];
  const resolvedUrls = useMemo(
    () => sourceItems.map((item) => resolveSource(item, props.keyName ?? '')),
    [props.keyName, sourceItems],
  );
  const maxCount = Math.max(0, positiveInteger(props.maxCount, 9));
  const rowCount = Math.max(1, positiveInteger(props.rowCount, 3));
  const visibleEntries = useMemo<AlbumEntry[]>(
    () => resolvedUrls.slice(0, maxCount).map((source, index) => ({ index, source })),
    [maxCount, resolvedUrls],
  );
  const rows = useMemo<AlbumEntry[][]>(() => {
    if (props.autoWrap) {
      return [visibleEntries];
    }

    const nextRows: AlbumEntry[][] = [];
    for (let index = 0; index < visibleEntries.length; index += rowCount) {
      nextRows.push(visibleEntries.slice(index, index + rowCount));
    }
    return nextRows;
  }, [props.autoWrap, rowCount, visibleEntries]);
  const multipleSize = nonNegativePx(props.multipleSize, 70);
  const singleSize = nonNegativePx(props.singleSize, 180);
  const space = nonNegativePx(props.space, 6);
  const shape = props.shape ?? config.props.image.shape;
  const radius = props.radius ?? config.props.image.radius;
  const [ratio, setRatio] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const isSingleImage = resolvedUrls.length === 1;
  const singleSource = isSingleImage ? resolvedUrls[0] : '';

  useEffect(() => {
    setRatio(null);
    if (!singleSource) {
      return;
    }

    let active = true;
    Image.getSize(
      singleSource,
      (width, height) => {
        if (active && width > 0 && height > 0) {
          setRatio(width / height);
        }
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [singleSource]);

  const fallbackSize = Math.min(
    singleSize,
    containerWidth > 0 ? containerWidth * 0.6 : singleSize,
  );
  const singleWidth = ratio && ratio >= 1
    ? singleSize
    : ratio
      ? singleSize * ratio
      : fallbackSize;
  const singleHeight = ratio && ratio >= 1
    ? singleSize / ratio
    : ratio
      ? singleSize
      : fallbackSize;
  const visibleUrlCount = visibleEntries.length;

  useEffect(() => {
    if (isSingleImage) {
      input.onAlbumWidth?.(singleWidth);
      return;
    }

    const firstRowCount = props.autoWrap
      ? visibleUrlCount
      : Math.min(rowCount, visibleUrlCount);
    const width = firstRowCount === 0
      ? 0
      : firstRowCount * multipleSize + (firstRowCount - 1) * space;
    input.onAlbumWidth?.(width);
  }, [input.onAlbumWidth, isSingleImage, multipleSize, props.autoWrap, resolvedUrls, rowCount, singleWidth, space, visibleUrlCount]);

  function handleLayout(event: LayoutChangeEvent): void {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  function preview(index: number, event?: GestureResponderEvent): void {
    if (props.previewFullImage && props.stop) {
      event?.stopPropagation();
    }
    input.onPreview?.({ currentIndex: index, urls: resolvedUrls });
  }

  return (
    <View
      onLayout={handleLayout}
      style={[{ flexDirection: 'column' }, input.customStyle]}
      testID="up-album"
    >
      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={{ flexDirection: 'row', flexWrap: props.autoWrap ? 'wrap' : 'nowrap' }}
          testID={`up-album-row-${rowIndex}`}
        >
          {row.map((entry, itemIndex) => {
            const isFinalRow = rowIndex === rows.length - 1;
            const isFinalItem = itemIndex === row.length - 1;
            const isSingleFrame = isSingleImage;
            const width = isSingleFrame ? singleWidth : multipleSize;
            const height = isSingleFrame ? singleHeight : multipleSize;
            const showMore = Boolean(
              props.showMore
              && resolvedUrls.length > maxCount
              && entry.index === visibleUrlCount - 1,
            );
            const itemStyle: ViewStyle = {
              marginBottom: props.autoWrap || !isFinalRow ? space : 0,
              marginRight: props.autoWrap || !isFinalItem ? space : 0,
              position: 'relative',
            };

            return (
              <Pressable
                key={`${entry.source}-${entry.index}`}
                onPress={(event) => preview(entry.index, event)}
                style={itemStyle}
                testID={`up-album-item-${entry.index}`}
              >
                <UPImage
                  height={height}
                  mode={isSingleFrame ? props.singleMode : props.multipleMode}
                  radius={radius}
                  shape={shape}
                  src={entry.source}
                  width={width}
                />
                {showMore ? (
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: shape === 'circle' ? 10000 : getPx(radius),
                      bottom: 0,
                      justifyContent: 'center',
                      left: 0,
                      position: 'absolute',
                      right: 0,
                      top: 0,
                    }}
                    testID="up-album-more"
                  >
                    <Text style={{ color: '#ffffff', fontSize: multipleSize * 0.3 }}>
                      +{resolvedUrls.length - maxCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
