import type { TextStyle, ViewStyle } from 'react-native';
import { getPx, type UPDimension } from '../../utils/dimensions';

type SourceSpacingStyle = Pick<
  ViewStyle,
  | 'margin'
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft'
  | 'marginHorizontal'
  | 'marginVertical'
  | 'padding'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingHorizontal'
  | 'paddingVertical'
>;

function sourceSpacingValues(value: UPDimension | undefined): number[] {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  return String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => getPx(part));
}

export function sourceSpacing(
  value: UPDimension | undefined,
  property: 'margin' | 'padding' = 'margin',
): SourceSpacingStyle {
  const values = sourceSpacingValues(value);
  if (!values.length) {
    return {};
  }

  const [top, right = top, bottom = top, left = right] = values;
  if (values.length === 1) {
    return { [property]: top };
  }
  if (values.length === 2) {
    return {
      [`${property}Horizontal`]: right,
      [`${property}Vertical`]: top,
    };
  }
  if (values.length === 3) {
    return {
      [`${property}Bottom`]: bottom,
      [`${property}Horizontal`]: right,
      [`${property}Top`]: top,
    };
  }
  return {
    [`${property}Bottom`]: bottom,
    [`${property}Left`]: left,
    [`${property}Right`]: right,
    [`${property}Top`]: top,
  };
}

export function sourceTextAlign(
  align: 'left' | 'center' | 'right',
): TextStyle['textAlign'] {
  return align;
}
