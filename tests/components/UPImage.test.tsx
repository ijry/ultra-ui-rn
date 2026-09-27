import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPImage, UPRoot } from '../../src';
import { getUPConfig } from '../../src/config/store';
import { sourceDefaults } from '../../src/config/defaults';

/**
 * UPImage 契约测试 —— 与 UPFlex.test.tsx 同样的「契约核对」处理。
 *
 * 唯一事实源是 8 端共享的 contracts/up-image.contract.json。按设计文档 §3
 * (镜像常量、不跨仓读文件),这里把契约里 16 个带 default 的 prop 内联镜像成
 * `contract`,逐项断言:
 *   1. 注册到全局 config 的 image 默认值(组件经 config.props.image 实际读到的那份)
 *   2. 源默认值 sourceDefaults.props.image(store 通过展开它完成注册)
 * 与契约逐项相等。任一侧漂移(键缺失 / 值改动 / 类型变化)都会被 toEqual 抓到。
 *
 * RN 不做任何 per-platform 默认值覆盖,故直接与 canonical default 比对。
 * lazyLoad / showMenuByLongpress / webp 在 RN 侧为 @deprecated 空操作,但默认值
 * 仍保留 canonical,以维持跨端 props 结构一致。
 */
const contract = {
  src: '',
  mode: 'aspectFill',
  width: '300',
  height: '225',
  shape: 'square',
  radius: 0,
  lazyLoad: true,
  showMenuByLongpress: true,
  loadingIcon: 'photo',
  errorIcon: 'error-circle',
  showLoading: true,
  showError: true,
  fade: true,
  webp: false,
  duration: 500,
  bgColor: '#f3f4f6',
};

const renderContent = (node: React.ReactElement) => render(<UPRoot>{node}</UPRoot>);

it('registers image defaults equal to the shared up-image contract', () => {
  expect({ ...getUPConfig().props.image }).toEqual(contract);
});

it('carries source defaults through to the registered config without drift', () => {
  expect({ ...sourceDefaults.props.image }).toEqual(contract);
});

it('anchors each contract default value (same style as UPFlex.test.tsx)', () => {
  const image = getUPConfig().props.image;
  expect(image.src).toBe('');
  expect(image.mode).toBe('aspectFill');
  expect(image.width).toBe('300');
  expect(image.height).toBe('225');
  expect(image.shape).toBe('square');
  expect(image.radius).toBe(0);
  expect(image.lazyLoad).toBe(true);
  expect(image.showMenuByLongpress).toBe(true);
  expect(image.loadingIcon).toBe('photo');
  expect(image.errorIcon).toBe('error-circle');
  expect(image.showLoading).toBe(true);
  expect(image.showError).toBe(true);
  expect(image.fade).toBe(true);
  expect(image.webp).toBe(false);
  expect(image.duration).toBe(500);
  expect(image.bgColor).toBe('#f3f4f6');
});

it('defaults to an error placeholder (no native Image) when src is empty', () => {
  const screen = renderContent(<UPImage />);
  expect(screen.getByTestId('up-image')).toBeTruthy();
  expect(screen.queryByTestId('up-image-native')).toBeNull();
  expect(screen.getByTestId('up-image-error')).toBeTruthy();
});

it('renders a native Image when a src is provided', () => {
  const screen = renderContent(<UPImage src="https://example.com/a.png" />);
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('renders a Pressable and fires onClick when provided', () => {
  const onClick = jest.fn();
  const screen = renderContent(<UPImage onClick={onClick} />);
  fireEvent.press(screen.getByTestId('up-image'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
