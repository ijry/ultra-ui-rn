import React, { createRef } from 'react';
import { act, render } from '@testing-library/react-native';
import {
  UPCalendarStrip,
  UPFormItem,
  type UPCalendarStripRef,
  UPCollapse,
  type UPCollapseRef,
  UPCountTo,
  type UPCountToRef,
  UPForm,
  type UPFormRef,
  UPNotify,
  type UPNotifyRef,
  UPReadMore,
  type UPReadMoreRef,
  UPToast,
  type UPToastRef,
  UPUpload,
  type UPUploadAdapter,
  type UPUploadRef,
  UPRoot,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('UPCountTo exposes source reStart and paused aliases', () => {
  const ref = createRef<UPCountToRef>();
  renderRoot(<UPCountTo autoplay={false} endVal={100} ref={ref} startVal={0} />);
  expect(typeof ref.current?.reStart).toBe('function');
  expect(typeof ref.current?.paused).toBe('function');
  act(() => {
    ref.current?.reStart();
    ref.current?.paused();
  });
});

it('UPForm setRules replaces the validation rules imperatively', async () => {
  const ref = createRef<UPFormRef>();
  const model = { email: '' };
  const screen = renderRoot(
    <UPForm model={model} ref={ref}>
      <UPFormItem label="Email" prop="email">
        <TextStub />
      </UPFormItem>
    </UPForm>,
  );
  expect(screen.getByTestId('up-form')).toBeTruthy();
  act(() => {
    ref.current?.setRules({ email: { required: true, message: 'Email required' } });
  });
  expect(typeof ref.current?.setRules).toBe('function');
  await expect(ref.current?.validate()).rejects.toBeTruthy();
});

function TextStub(): React.JSX.Element {
  return <></>;
}

it('UPUpload ref exposes source chooseFile alias', async () => {
  const uploadAdapter: UPUploadAdapter = {
    chooseFile: async () => [{ name: 'photo.jpg', size: 1, type: 'image/jpeg', uri: 'file://photo.jpg' }],
    previewFile: jest.fn(),
    uploadFile: jest.fn(),
  };
  const ref = createRef<UPUploadRef>();
  renderRoot(<UPUpload autoUpload={false} ref={ref} uploadAdapter={uploadAdapter} />);
  expect(typeof ref.current?.chooseFile).toBe('function');
  await act(async () => {
    await ref.current?.chooseFile();
  });
  expect(ref.current?.getFiles()).toHaveLength(1);
});

it('UPCalendarStrip ref navigates months and toggles full calendar', () => {
  const ref = createRef<UPCalendarStripRef>();
  const onMonthChange = jest.fn();
  const screen = renderRoot(
    <UPCalendarStrip fullCalendar modelValue="2024-05-10" onMonthChange={onMonthChange} ref={ref} />,
  );
  expect(screen.getByTestId('up-calendar-strip')).toBeTruthy();
  act(() => {
    ref.current?.nextMonth();
  });
  expect(onMonthChange).toHaveBeenCalled();
  act(() => {
    ref.current?.prevMonth();
  });
  act(() => {
    ref.current?.toggleFull();
  });
  expect(screen.getByTestId('up-calendar-strip-full')).toBeTruthy();
});

it('UPReadMore init re-measures content', () => {
  const ref = createRef<UPReadMoreRef>();
  const screen = renderRoot(
    <UPReadMore ref={ref} showHeight="40px">
      <>{'long content '.repeat(60)}</>
    </UPReadMore>,
  );
  expect(typeof ref.current?.init).toBe('function');
  act(() => {
    ref.current?.init();
  });
  expect(screen.getByTestId('up-read-more')).toBeTruthy();
});

it('UPToast ref show drives an imperative toast', () => {
  const ref = createRef<UPToastRef>();
  const onChangeShow = jest.fn();
  const screen = renderRoot(<UPToast duration={0} onChangeShow={onChangeShow} ref={ref} />);
  expect(screen.queryByTestId('up-toast')).toBeNull();
  act(() => {
    ref.current?.show({ message: 'Imperative toast', type: 'success' });
  });
  expect(screen.getByText('Imperative toast')).toBeTruthy();
  expect(onChangeShow).toHaveBeenCalledWith(true);
});

it('UPNotify ref show and close work imperatively', () => {
  const ref = createRef<UPNotifyRef>();
  const onChangeShow = jest.fn();
  const screen = renderRoot(<UPNotify duration={0} onChangeShow={onChangeShow} ref={ref} />);
  expect(screen.queryByTestId('up-notify')).toBeNull();
  act(() => {
    ref.current?.show({ message: 'Imperative notify' });
  });
  expect(screen.getByText('Imperative notify')).toBeTruthy();
  act(() => {
    ref.current?.close();
  });
  expect(screen.queryByTestId('up-notify')).toBeNull();
  expect(onChangeShow).toHaveBeenLastCalledWith(false);
});

it('UPCollapse init re-syncs item names', () => {
  const ref = createRef<UPCollapseRef>();
  const screen = renderRoot(
    <UPCollapse ref={ref}>
      <FakeCollapseChild name="a" />
      <FakeCollapseChild name="b" />
    </UPCollapse>,
  );
  expect(typeof ref.current?.init).toBe('function');
  act(() => {
    ref.current?.init();
  });
  expect(screen.getByTestId('up-collapse')).toBeTruthy();
});

function FakeCollapseChild({ name }: { name: string }): React.JSX.Element {
  return <>{name}</>;
}
