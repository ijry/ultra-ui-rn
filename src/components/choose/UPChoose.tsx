import React, { useEffect, useState } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import type { UPChooseModelValue, UPChooseOption } from '../../config';
import { getPx, type UPDimension } from '../../utils';
import { UPTag } from '../tag';

export type UPChooseRenderItemArgs = {
  item: UPChooseOption;
  index: number;
  selected: boolean;
  press: () => void;
};

export type UPChooseProps = {
  options?: readonly UPChooseOption[];
  modelValue?: UPChooseModelValue;
  type?: string;
  itemWidth?: UPDimension;
  itemHeight?: UPDimension;
  itemPadding?: UPDimension;
  labelName?: string;
  valueName?: string;
  customClick?: boolean;
  wrap?: boolean;
  renderItem?: (args: UPChooseRenderItemArgs) => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onUpdateModelValue?: (index: number) => void;
  onCustomClick?: (index: number) => void;
};

function sourceSelected(index: number, currentIndex: UPChooseModelValue): boolean {
  return index == (currentIndex as unknown as number);
}

export function UPChoose(input: UPChooseProps): React.JSX.Element {
  const props = { ...useUPConfig().props.choose, ...input } as UPChooseProps;
  const [currentIndex, setCurrentIndex] = useState<UPChooseModelValue>(props.modelValue ?? false);

  useEffect(() => {
    setCurrentIndex(props.modelValue ?? false);
  }, [props.modelValue]);

  const width = props.itemWidth === 'auto' || props.itemWidth === undefined
    ? undefined
    : getPx(props.itemWidth);
  const press = (index: number) => {
    if (props.customClick) {
      input.onCustomClick?.(index);
      return;
    }
    setCurrentIndex(index);
    input.onUpdateModelValue?.(index);
  };
  const choices = (props.options ?? []).map((item, index) => {
    const selected = sourceSelected(index, currentIndex);
    const itemPress = () => press(index);
    const node = input.renderItem?.({ item, index, press: itemPress, selected }) ?? (
      <UPTag
        customStyle={{ ...(width === undefined ? {} : { width }), padding: getPx(props.itemPadding ?? '8px') }}
        height={props.itemHeight}
        plain={!selected}
        size="large"
        text={String(item[props.labelName ?? 'title'] ?? '')}
        testID={`up-choose-option-${index}`}
        type={selected ? 'primary' : 'info'}
        onClick={itemPress}
      />
    );
    const sourceId = item.id;
    const key = typeof sourceId === 'string' || typeof sourceId === 'number'
      ? String(sourceId)
      : String(index);
    return (
      <View key={key} style={width === undefined ? undefined : { width }} testID={`up-choose-item-${index}`}>
        {node}
      </View>
    );
  });
  const contentStyle: ViewStyle = props.wrap
    ? { flexDirection: 'row', flexWrap: 'wrap' }
    : { flexDirection: 'row' };
  const content = <View style={contentStyle}>{choices}</View>;

  return (
    <View style={input.customStyle} testID="up-choose">
      {props.wrap ? content : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} testID="up-choose-scroll">
          {content}
        </ScrollView>
      )}
    </View>
  );
}
