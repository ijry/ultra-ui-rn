import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getUPConfig } from '../config/store';
import { UPNotify, type UPNotifyOptions } from '../components/notify';
import { UPToast, type UPToastOptions } from '../components/toast';
import { useUPOverlay } from '../overlay';

export type UPToastApi = {
  show: (options: UPToastOptions) => void;
  hide: () => void;
  primary: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  default: (message: string) => void;
  loading: (message: string) => void;
};

export type UPNotifyApi = {
  show: (options: UPNotifyOptions) => void;
  hide: () => void;
  primary: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
};

type UPFeedbackApi = {
  notify: UPNotifyApi;
  toast: UPToastApi;
};

let feedbackApi: UPFeedbackApi | null = null;

function callToast(type: NonNullable<UPToastOptions['type']>, message: string): void {
  feedbackApi?.toast.show({ message, type });
}

function callNotify(type: NonNullable<UPNotifyOptions['type']>, message: string): void {
  feedbackApi?.notify.show({ message, type });
}

export const toast: UPToastApi = {
  default: (message) => callToast('default', message),
  error: (message) => callToast('error', message),
  hide: () => feedbackApi?.toast.hide(),
  loading: (message) => callToast('loading', message),
  primary: (message) => callToast('primary', message),
  show: (options) => feedbackApi?.toast.show(options),
  success: (message) => callToast('success', message),
  warning: (message) => callToast('warning', message),
};

export const notify: UPNotifyApi = {
  error: (message) => callNotify('error', message),
  hide: () => feedbackApi?.notify.hide(),
  primary: (message) => callNotify('primary', message),
  show: (options) => feedbackApi?.notify.show(options),
  success: (message) => callNotify('success', message),
  warning: (message) => callNotify('warning', message),
};

export function UPFeedbackHost(): React.JSX.Element | null {
  const overlay = useUPOverlay();
  const [toastOptions, setToastOptions] = useState<UPToastOptions | null>(null);
  const [notifyOptions, setNotifyOptions] = useState<UPNotifyOptions | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = null;
    setToastOptions(null);
  }, []);
  const hideNotify = useCallback(() => {
    if (notifyTimer.current) clearTimeout(notifyTimer.current);
    notifyTimer.current = null;
    setNotifyOptions(null);
  }, []);
  const showToast = useCallback((options: UPToastOptions) => {
    hideToast();
    const value = { ...getUPConfig().props.toast, ...options } as UPToastOptions;
    setToastOptions(value);
    const duration = Number(value.duration);
    if (duration > 0) {
      toastTimer.current = setTimeout(() => {
        value.complete?.();
        hideToast();
      }, duration);
    }
  }, [hideToast]);
  const showNotify = useCallback((options: UPNotifyOptions) => {
    hideNotify();
    const value = { ...getUPConfig().props.notify, ...options } as UPNotifyOptions;
    setNotifyOptions(value);
    const duration = Number(value.duration);
    if (duration > 0) notifyTimer.current = setTimeout(hideNotify, duration);
  }, [hideNotify]);

  useEffect(() => {
    const api: UPFeedbackApi = {
      notify: { error: (message) => showNotify({ message, type: 'error' }), hide: hideNotify, primary: (message) => showNotify({ message, type: 'primary' }), show: showNotify, success: (message) => showNotify({ message, type: 'success' }), warning: (message) => showNotify({ message, type: 'warning' }) },
      toast: { default: (message) => showToast({ message, type: 'default' }), error: (message) => showToast({ message, type: 'error' }), hide: hideToast, loading: (message) => showToast({ message, type: 'loading' }), primary: (message) => showToast({ message, type: 'primary' }), show: showToast, success: (message) => showToast({ message, type: 'success' }), warning: (message) => showToast({ message, type: 'warning' }) },
    };
    feedbackApi = api;
    return () => {
      if (feedbackApi === api) feedbackApi = null;
      hideToast();
      hideNotify();
    };
  }, [hideNotify, hideToast, showNotify, showToast]);

  useEffect(() => {
    if (!toastOptions) {
      overlay.remove('up-feedback-toast');
      return;
    }
    overlay.add({
      id: 'up-feedback-toast',
      node: <UPToast {...toastOptions} duration={-1} onChangeShow={hideToast} show />,
      zIndex: Number(toastOptions.zIndex ?? 10090),
    });
  }, [hideToast, overlay, toastOptions]);
  useEffect(() => {
    if (!notifyOptions) {
      overlay.remove('up-feedback-notify');
      return;
    }
    overlay.add({
      id: 'up-feedback-notify',
      node: <UPNotify {...notifyOptions} duration={-1} onChangeShow={hideNotify} show />,
      zIndex: 10076,
    });
  }, [hideNotify, notifyOptions, overlay]);

  return null;
}
