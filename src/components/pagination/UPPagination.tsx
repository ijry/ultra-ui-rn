import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { range } from '../../utils';
import { UPIcon } from '../icon';

export type UPPaginationSize = number | string | { label?: string; value: number | string };

export type UPPaginationProps = {
  currentPage?: number;
  pageSize?: number;
  total?: number;
  prevText?: string;
  nextText?: string;
  buttonBgColor?: string;
  buttonBorderColor?: string;
  pageSizes?: readonly UPPaginationSize[];
  layout?: string;
  hideOnSinglePage?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onUpdateCurrentPage?: (page: number) => void;
  onUpdatePageSize?: (size: number) => void;
  onCurrentChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
};

type NormalizedSize = { label: string; value: number };

function normalizeSizes(values: readonly UPPaginationSize[]): NormalizedSize[] {
  return values.flatMap((item) => {
    const raw = typeof item === 'object' ? item.value : item;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return [];
    return [{ label: typeof item === 'object' && item.label ? item.label : `${value}条/页`, value }];
  });
}

function pagesFor(totalPages: number, current: number): Array<number | '...'> {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (current <= 2) return [1, 2, 3, 4, '...', totalPages];
  if (current >= totalPages - 1) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', current - 1, current, current + 1, '...', totalPages];
}

export function UPPagination(input: UPPaginationProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.pagination, ...input } as UPPaginationProps;
  const [sizesOpen, setSizesOpen] = useState(false);
  const totalPages = Math.max(1, Math.ceil(Number(props.total ?? 0) / Math.max(1, Number(props.pageSize ?? 10))));
  const current = range(1, totalPages, Number(props.currentPage ?? 1));
  const pageSizes = useMemo(() => normalizeSizes(props.pageSizes ?? []), [props.pageSizes]);
  const layout = (props.layout ?? '').split(',').map((item) => item.trim());
  const buttonStyle: ViewStyle = { alignItems: 'center', backgroundColor: props.buttonBgColor, borderColor: props.buttonBorderColor, borderRadius: 4, borderWidth: 1, justifyContent: 'center', minHeight: 32, minWidth: 44, paddingHorizontal: 6 };
  const changePage = (page: number) => {
    if (page === current) return;
    input.onUpdateCurrentPage?.(page);
    input.onCurrentChange?.(page);
  };
  const changeSize = (size: number) => {
    setSizesOpen(false);
    input.onUpdatePageSize?.(size);
    input.onSizeChange?.(size);
  };
  if (props.hideOnSinglePage && totalPages <= 1) return null;

  return (
    <View style={[{ alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 4 }, input.customStyle]} testID="up-pagination">
      {layout.includes('prev') ? <Pressable accessibilityRole="button" disabled={current === 1} onPress={() => changePage(current - 1)} style={[buttonStyle, current === 1 ? { opacity: 0.5 } : null]} testID="up-pagination-prev">{props.prevText ? <Text>{props.prevText}</Text> : <UPIcon name="arrow-left" />}</Pressable> : null}
      {layout.includes('pager') ? pagesFor(totalPages, current).map((page, index) => page === '...' ? <Text key={`ellipsis-${index}`} style={{ paddingHorizontal: 2 }}>...</Text> : <Pressable accessibilityRole="button" accessibilityState={{ selected: page === current }} key={page} onPress={() => changePage(page)} style={[{ alignItems: 'center', borderRadius: 4, justifyContent: 'center', minHeight: 32, minWidth: 32, paddingHorizontal: 8 }, page === current ? { backgroundColor: '#409eff' } : null]} testID={`up-pagination-page-${page}`}><Text style={{ color: page === current ? '#ffffff' : '#606266' }}>{page}</Text></Pressable>) : null}
      {layout.includes('total') && Number(props.total) > 0 ? <Text style={{ color: '#606266', fontSize: 14, marginRight: 6 }}>共 {props.total} 条</Text> : null}
      {layout.includes('sizes') && pageSizes.length ? <Pressable accessibilityRole="button" onPress={() => setSizesOpen(true)} style={buttonStyle} testID="up-pagination-size-trigger"><Text>{pageSizes.find((size) => size.value === props.pageSize)?.label ?? props.pageSize}</Text></Pressable> : null}
      {layout.includes('next') ? <Pressable accessibilityRole="button" disabled={current === totalPages} onPress={() => changePage(current + 1)} style={[buttonStyle, current === totalPages ? { opacity: 0.5 } : null]} testID="up-pagination-next">{props.nextText ? <Text>{props.nextText}</Text> : <UPIcon name="arrow-right" />}</Pressable> : null}
      <Modal animationType="fade" onRequestClose={() => setSizesOpen(false)} transparent visible={sizesOpen}>
        <Pressable onPress={() => setSizesOpen(false)} style={{ alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', flex: 1, justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, minWidth: 180, paddingVertical: 8 }}>
            {pageSizes.map((size) => <Pressable accessibilityRole="button" key={size.value} onPress={() => changeSize(size.value)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 }} testID={`up-pagination-size-${size.value}`}><Text style={{ color: '#303133', fontSize: 16 }}>{size.label}</Text></Pressable>)}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
