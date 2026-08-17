import React, { Children, isValidElement, useEffect, useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPLine } from '../line';
import { UPCollapseContext, type UPCollapseName } from './context';

export type UPCollapseChange = { name: UPCollapseName; status: 'open' | 'close' };

export type UPCollapseProps = {
  value?: UPCollapseName | readonly UPCollapseName[] | null;
  modelValue?: UPCollapseName | readonly UPCollapseName[] | null;
  accordion?: boolean;
  border?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onChange?: (items: UPCollapseChange[]) => void;
  onOpen?: (name: UPCollapseName) => void;
  onClose?: (name: UPCollapseName) => void;
};

function namesFromChildren(children: React.ReactNode): UPCollapseName[] {
  return Children.toArray(children).map((child, index) => {
    if (!isValidElement<{ name?: UPCollapseName }>(child)) {
      return index;
    }
    const name = child.props.name;
    return name === undefined || name === '' ? index : name;
  });
}

function selectionFromValue(
  value: UPCollapseProps['value'],
  accordion: boolean,
): UPCollapseName[] {
  if (value === null || value === undefined || value === '') {
    return [];
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    const values = Array.from(value);
    return accordion ? values.slice(0, 1) : values;
  }
  return [value];
}

export function UPCollapse(input: UPCollapseProps): React.JSX.Element {
  const props = { ...useUPConfig().props.collapse, ...input } as UPCollapseProps;
  const external = input.value ?? input.modelValue;
  const names = useMemo(() => namesFromChildren(input.children), [input.children]);
  const initial = selectionFromValue(external ?? props.value, Boolean(props.accordion));
  const [selected, setSelected] = useState<UPCollapseName[]>(initial);

  useEffect(() => {
    if (external !== undefined) {
      setSelected(selectionFromValue(external, Boolean(props.accordion)));
    }
  }, [external, props.accordion]);

  const context = useMemo(
    () => ({
      accordion: Boolean(props.accordion),
      border: Boolean(props.border),
      selected,
      toggle: (name: UPCollapseName) => {
        const isOpen = selected.includes(name);
        const next = props.accordion
          ? isOpen ? [] : [name]
          : isOpen ? selected.filter((value) => value !== name) : [...selected, name];
        setSelected(next);
        input.onChange?.(names.map((itemName) => ({
          name: itemName,
          status: next.includes(itemName) ? 'open' : 'close',
        })));
        if (isOpen) {
          input.onClose?.(name);
        } else {
          input.onOpen?.(name);
        }
      },
    }),
    [input, names, props.accordion, props.border, selected],
  );

  return (
    <UPCollapseContext.Provider value={context}>
      <View style={input.customStyle} testID="up-collapse">
        {props.border ? <UPLine /> : null}
        {Children.map(input.children, (child, index) =>
          isValidElement(child) ? React.cloneElement(child, { itemIndex: index } as object) : child,
        )}
      </View>
    </UPCollapseContext.Provider>
  );
}
