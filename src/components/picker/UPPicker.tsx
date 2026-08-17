import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils';
import { UPInput } from '../input';
import { UPLoadingIcon } from '../loading-icon';
import { UPPopup } from '../popup';
import { UPToolbar } from '../toolbar';
import {
  clonePickerColumns,
  normalizePickerIndexes,
  optionText,
  pickerChangePayload,
  pickerConfirmPayload,
  pickerDisplay,
  pickerPrimitiveValues,
  pickerSelectedValues,
  resolvePickerIndexes,
} from './value';
import type {
  UPPickerColumns,
  UPPickerOption,
  UPPickerProps,
  UPPickerRef,
} from './types';

export type { UPPickerProps, UPPickerRef } from './types';

function asColumns(value: unknown): UPPickerColumns {
  return Array.isArray(value) ? value as UPPickerColumns : [];
}

function visibleItemCount(value: number | string | undefined): number {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? Math.max(1, parsed) : 5;
}

function PickerColumn({
  column,
  columnIndex,
  indexes,
  itemHeight,
  listHeight,
  padding,
  keyName,
  selectIndex,
}: {
  column: readonly UPPickerOption[];
  columnIndex: number;
  indexes: readonly number[];
  itemHeight: number;
  listHeight: number;
  padding: number;
  keyName: string;
  selectIndex: (columnIndex: number, index: number) => void;
}): React.JSX.Element {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = indexes[columnIndex] ?? 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ animated: false, y: selectedIndex * itemHeight });
  }, [itemHeight, selectedIndex]);

  const handleMomentum = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    selectIndex(columnIndex, nextIndex);
  };

  return (
    <ScrollView
      decelerationRate="fast"
      onMomentumScrollEnd={handleMomentum}
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      style={{ flex: 1, height: listHeight }}
      testID={`up-picker-column-${columnIndex}`}
    >
      <View style={{ paddingBottom: padding, paddingTop: padding }}>
        {column.map((option, index) => {
          const selected = index === selectedIndex;
          return (
            <Pressable
              accessibilityRole="button"
              key={`${optionText(option, keyName)}-${index}`}
              onPress={() => {
                scrollRef.current?.scrollTo({ animated: true, y: index * itemHeight });
                selectIndex(columnIndex, index);
              }}
              style={{ alignItems: 'center', height: itemHeight, justifyContent: 'center' }}
              testID={`up-picker-option-${columnIndex}-${index}`}
            >
              <Text style={{ color: '#303133', fontSize: 16, fontWeight: selected ? '700' : '400' }}>
                {optionText(option, keyName)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export const UPPicker = forwardRef<UPPickerRef, UPPickerProps>(function UPPicker(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.picker, ...input } as UPPickerProps;
  const resolvedColumns = asColumns(props.columns);
  const keyName = props.keyName ?? 'text';
  const valueName = props.valueName ?? 'value';
  const [innerColumns, setInnerColumns] = useState<UPPickerColumns>(() => clonePickerColumns(resolvedColumns));
  const [draftIndexes, setDraftIndexes] = useState(() => (
    resolvePickerIndexes(resolvedColumns, input.modelValue, props.defaultIndex, valueName)
  ));
  const [confirmedIndexes, setConfirmedIndexes] = useState(() => (
    resolvePickerIndexes(resolvedColumns, input.modelValue, props.defaultIndex, valueName)
  ));
  const [inputOpen, setInputOpen] = useState(false);
  const columnsRef = useRef(innerColumns);
  const draftIndexesRef = useRef(draftIndexes);
  const confirmedIndexesRef = useRef(confirmedIndexes);

  useEffect(() => {
    columnsRef.current = innerColumns;
  }, [innerColumns]);

  useEffect(() => {
    draftIndexesRef.current = draftIndexes;
  }, [draftIndexes]);

  useEffect(() => {
    confirmedIndexesRef.current = confirmedIndexes;
  }, [confirmedIndexes]);

  useEffect(() => {
    const columns = clonePickerColumns(resolvedColumns);
    const indexes = resolvePickerIndexes(columns, input.modelValue, props.defaultIndex, valueName);
    setInnerColumns(columns);
    setDraftIndexes(indexes);
    setConfirmedIndexes(indexes);
  }, [input.modelValue, props.defaultIndex, resolvedColumns, valueName]);

  const commitDraftIndexes = useCallback((indexes: readonly number[]) => {
    const normalized = normalizePickerIndexes(columnsRef.current, indexes);
    draftIndexesRef.current = normalized;
    setDraftIndexes(normalized);
    return normalized;
  }, []);

  const commitConfirmedIndexes = useCallback((indexes: readonly number[]) => {
    const normalized = normalizePickerIndexes(columnsRef.current, indexes);
    confirmedIndexesRef.current = normalized;
    draftIndexesRef.current = normalized;
    setConfirmedIndexes(normalized);
    setDraftIndexes(normalized);
    return normalized;
  }, []);

  const selectIndex = useCallback((columnIndex: number, requestedIndex: number) => {
    const current = draftIndexesRef.current;
    const next = [...current];
    next[columnIndex] = requestedIndex;
    const normalized = commitDraftIndexes(next);
    input.onChange?.(pickerChangePayload(columnsRef.current, normalized, columnIndex));
  }, [commitDraftIndexes, input]);

  const closeInput = () => {
    if (input.hasInput) setInputOpen(false);
  };

  const restoreConfirmed = () => {
    commitDraftIndexes(confirmedIndexesRef.current);
  };

  const handleCancel = () => {
    restoreConfirmed();
    closeInput();
    input.onChangeShow?.(false);
    input.onCancel?.();
  };

  const handleConfirm = () => {
    const indexes = commitConfirmedIndexes(draftIndexesRef.current);
    const columns = columnsRef.current;
    input.onUpdateModelValue?.(pickerPrimitiveValues(columns, indexes, valueName));
    if (input.closeOnConfirm !== false) {
      closeInput();
      input.onChangeShow?.(false);
    }
    input.onConfirm?.(pickerConfirmPayload(columns, indexes));
  };

  const handleOverlayChange = (show: boolean) => {
    if (!show) closeInput();
    input.onChangeShow?.(show);
  };

  const handleOverlayClose = () => {
    restoreConfirmed();
    closeInput();
    input.onClose?.();
  };

  useImperativeHandle(ref, () => ({
    getColumnValues(columnIndex) {
      return columnsRef.current[columnIndex] ?? [];
    },
    getIndexs() {
      return [...draftIndexesRef.current];
    },
    getValues() {
      return pickerSelectedValues(columnsRef.current, draftIndexesRef.current);
    },
    setColumns(columns) {
      const nextColumns = clonePickerColumns(columns);
      columnsRef.current = nextColumns;
      setInnerColumns(nextColumns);
      const indexes = resolvePickerIndexes(nextColumns, input.modelValue, props.defaultIndex, valueName);
      commitConfirmedIndexes(indexes);
    },
    setColumnValues(columnIndex, values) {
      const nextColumns = columnsRef.current.map((column, index) => (
        index === columnIndex ? [...values] : [...column]
      ));
      columnsRef.current = nextColumns;
      setInnerColumns(nextColumns);
      const indexes = [...draftIndexesRef.current];
      for (let index = columnIndex + 1; index < nextColumns.length; index += 1) indexes[index] = 0;
      commitDraftIndexes(indexes);
    },
    setIndexs(indexes, setLastIndex = false) {
      if (setLastIndex) {
        commitConfirmedIndexes(indexes);
        return;
      }
      commitDraftIndexes(indexes);
    },
  }), [commitConfirmedIndexes, commitDraftIndexes, input.modelValue, props.defaultIndex, valueName]);

  const itemHeight = getPx(props.itemHeight ?? 44);
  const count = visibleItemCount(props.visibleItemCount);
  const listHeight = itemHeight * count;
  const padding = ((count - 1) * itemHeight) / 2;
  const shown = Boolean(props.show || inputOpen);
  const inputIndexes = input.modelValue === undefined
    ? confirmedIndexes
    : resolvePickerIndexes(innerColumns, input.modelValue, props.defaultIndex, valueName);
  const inputLabel = pickerDisplay(innerColumns, inputIndexes, keyName);
  const trigger = typeof input.trigger === 'function' ? input.trigger(inputLabel) : input.trigger;

  const panel = (
    <View style={{ position: 'relative' }} testID="up-picker">
      {props.showToolbar ? (
        <UPToolbar
          cancelColor={props.cancelColor}
          cancelText={props.cancelText}
          confirmColor={props.confirmColor}
          confirmText={props.confirmText}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          right={input.toolbarRight}
          rightSlot={props.toolbarRightSlot}
          title={props.title}
        />
      ) : null}
      {input.toolbarBottom}
      <View style={{ height: listHeight, overflow: 'hidden', position: 'relative' }}>
        <View
          pointerEvents="none"
          style={{
            borderBottomColor: '#e4e7ed',
            borderBottomWidth: 1,
            borderTopColor: '#e4e7ed',
            borderTopWidth: 1,
            height: itemHeight,
            left: 0,
            position: 'absolute',
            right: 0,
            top: padding,
            zIndex: 1,
          }}
          testID="up-picker-selection-band"
        />
        <View style={{ flexDirection: 'row', height: listHeight }}>
          {innerColumns.map((column, columnIndex) => (
            <PickerColumn
              column={column}
              columnIndex={columnIndex}
              indexes={draftIndexes}
              itemHeight={itemHeight}
              key={columnIndex}
              keyName={keyName}
              listHeight={listHeight}
              padding={padding}
              selectIndex={selectIndex}
            />
          ))}
        </View>
      </View>
      {props.loading ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: props.bgColor || '#ffffff',
            bottom: 0,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 2,
          }}
          testID="up-picker-loading"
        >
          <UPLoadingIcon mode="circle" />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={input.customStyle} testID={input.hasInput ? undefined : 'up-picker-host'}>
      {input.hasInput ? (
        <Pressable
          accessibilityRole="button"
          disabled={props.disabled}
          onPress={() => setInputOpen(true)}
          testID="up-picker-trigger"
        >
          {trigger ?? (
            <UPInput
              {...props.inputProps}
              border={props.inputBorder}
              disabled={props.disabled}
              disabledColor={props.disabledColor}
              placeholder={props.placeholder}
              readonly
              value={inputLabel}
            />
          )}
        </Pressable>
      ) : null}
      <UPPopup
        bgColor={props.bgColor}
        closeOnClickOverlay={props.closeOnClickOverlay}
        duration={props.duration}
        mode={props.popupMode}
        onChangeShow={handleOverlayChange}
        onClose={handleOverlayClose}
        overlayOpacity={props.overlayOpacity}
        pageInline={props.pageInline}
        round={props.round}
        show={shown}
        zIndex={props.zIndex}
      >
        {panel}
      </UPPopup>
    </View>
  );
});
