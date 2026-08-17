import { getUPConfig, setUPConfig } from './config/store';
import { notify, toast } from './feedback';
import * as utils from './utils';

export const UP = {
  setConfig: setUPConfig,
  get config() {
    return getUPConfig().config;
  },
  get color() {
    return getUPConfig().color;
  },
  get zIndex() {
    return getUPConfig().zIndex;
  },
  get props() {
    return getUPConfig().props;
  },
  notify,
  toast,
  ...utils,
};

export * from './config';
export * from './components';
export * from './feedback';
export * from './icons';
export * from './overlay';
export * from './theme';
export * from './utils';
