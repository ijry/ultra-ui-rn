import { Dimensions } from 'react-native';

export type UPDimension = number | string;

function numeric(value: UPDimension): number {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function rpx2px(
  value: UPDimension,
  width = Dimensions.get('window').width,
): number {
  return (numeric(value) * width) / 750;
}

export function getPx(
  value: UPDimension,
  width = Dimensions.get('window').width,
): number {
  const text = String(value).trim();
  return /(rpx|upx)$/i.test(text) ? rpx2px(text, width) : numeric(text);
}

export function range(min = 0, max = 0, value = 0): number {
  return Math.max(min, Math.min(max, Number(value)));
}
