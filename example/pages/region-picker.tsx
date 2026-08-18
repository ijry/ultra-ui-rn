/**
 * P47 — Cascading province/city/area picker built on UPPicker columns and
 * its setColumnValues ref method. Replicates the source `u-picker mode="region"`
 * UX used by the address and citySelect template pages.
 */
import React, { useRef, useState } from 'react';
import {
  UPPicker,
  type UPPickerChangePayload,
  type UPPickerColumns,
  type UPPickerConfirmPayload,
  type UPPickerOption,
  type UPPickerRef,
} from 'ultra-ui-rn';
import { DEMO_REGION } from './types';

const option = (label: string): UPPickerOption => ({ label });

const INITIAL_COLUMNS: UPPickerColumns = [
  DEMO_REGION.map((province) => option(province.label)),
  DEMO_REGION[0].children.map((city) => option(city.label)),
  DEMO_REGION[0].children[0].children.map((area) => option(area)),
];

export function RegionPicker(props: {
  onConfirm?: (value: string[]) => void;
  onChangeShow: (show: boolean) => void;
  show: boolean;
  title?: string;
}) {
  const ref = useRef<UPPickerRef>(null);
  const [columns] = useState<UPPickerColumns>(INITIAL_COLUMNS);

  const handleChange = (payload: UPPickerChangePayload) => {
    const province = DEMO_REGION[payload.indexs[0] ?? 0];
    if (!province) return;
    if (payload.columnIndex === 0) {
      ref.current?.setColumnValues(1, province.children.map((city) => option(city.label)));
      ref.current?.setColumnValues(
        2,
        (province.children[0]?.children ?? []).map((area) => option(area)),
      );
    } else if (payload.columnIndex === 1) {
      const city = province.children[payload.indexs[1] ?? 0];
      if (city) {
        ref.current?.setColumnValues(2, city.children.map((area) => option(area)));
      }
    }
  };

  const handleConfirm = (payload: UPPickerConfirmPayload) => {
    props.onConfirm?.(payload.value.map(String));
  };

  return (
    <UPPicker
      columns={columns}
      keyName="label"
      onChange={handleChange}
      onChangeShow={props.onChangeShow}
      onConfirm={handleConfirm}
      ref={ref}
      show={props.show}
      title={props.title ?? '所在地区'}
    />
  );
}
