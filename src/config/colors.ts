export type UPColorTokens = {
  primary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  /** Alias of `info` (source `color.default`). */
  default: string;
  mainColor: string;
  contentColor: string;
  tipsColor: string;
  lightColor: string;
  borderColor: string;
  bgColor: string;
  disabledColor: string;
};

export const sourceLightColors: Readonly<UPColorTokens> = Object.freeze({
  primary: '#3c9cff',
  success: '#5ac725',
  warning: '#f9ae3d',
  error: '#f56c6c',
  info: '#909399',
  default: '#909399',
  mainColor: '#303133',
  contentColor: '#606266',
  tipsColor: '#909399',
  lightColor: '#c0c4cc',
  borderColor: '#e4e7ed',
  bgColor: '#f3f4f6',
  disabledColor: '#c8c9cc',
});
