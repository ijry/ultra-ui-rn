import React, { createRef } from 'react';
import { act, render } from '@testing-library/react-native';
import { UPForm, UPFormItem, type UPFormRef, UPRoot } from '../../src';

function renderForm(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('validates source required, pattern, and item-level custom rules', async () => {
  const formRef = createRef<UPFormRef>();
  const model = { profile: { name: '', code: 'abc', token: 'wrong' } };
  const screen = renderForm(
    <UPForm
      ref={formRef}
      model={model}
      rules={{
        'profile.name': { required: true, message: 'Name is required' },
        'profile.code': { pattern: /^\d+$/, message: 'Digits only' },
      }}
    >
      <UPFormItem label="Name" prop="profile.name" required />
      <UPFormItem label="Code" prop="profile.code" />
      <UPFormItem
        label="Token"
        prop="profile.token"
        rules={[{ message: 'Token is invalid', validator: (value) => value === 'valid' }]}
      />
    </UPForm>,
  );

  let validationError: unknown;
  await act(async () => {
    try {
      await formRef.current?.validate();
    } catch (error) {
      validationError = error;
    }
  });
  expect(validationError).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ message: 'Name is required', prop: 'profile.name' }),
      expect.objectContaining({ message: 'Digits only', prop: 'profile.code' }),
      expect.objectContaining({ message: 'Token is invalid', prop: 'profile.token' }),
    ]),
  );
  expect(screen.getByText('Name is required')).toBeTruthy();
  expect(screen.getByText('Digits only')).toBeTruthy();
  expect(screen.getByText('Token is invalid')).toBeTruthy();
});

it('supports field validation, source border-bottom errors, clearing, and reset snapshots', async () => {
  const formRef = createRef<UPFormRef>();
  const model = { email: '', name: 'Original' };
  const screen = renderForm(
    <UPForm
      ref={formRef}
      errorType="border-bottom"
      model={model}
      rules={{ email: { required: true, message: 'Email is required' } }}
    >
      <UPFormItem label="Email" prop="email" />
      <UPFormItem label="Name" prop="name" rules={[{ min: 8, message: 'Name is too short' }]} />
    </UPForm>,
  );

  let validationError: unknown;
  await act(async () => {
    try {
      await formRef.current?.validateField('email');
    } catch (error) {
      validationError = error;
    }
  });
  expect(validationError).toEqual([
    expect.objectContaining({ message: 'Email is required', prop: 'email' }),
  ]);
  expect(screen.queryByText('Email is required')).toBeNull();
  expect(screen.getByTestId('up-form-item-email-line').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ backgroundColor: '#f56c6c' })]),
  );

  act(() => {
    formRef.current?.clearValidate('email');
  });
  expect(screen.getByTestId('up-form-item-email-line').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ backgroundColor: '#d6d7d9' })]),
  );

  model.name = 'Changed';
  await act(async () => {
    try {
      await formRef.current?.validateField('name');
    } catch {
      // The validation state rerender is required to reproduce field re-registration.
    }
  });
  act(() => {
    formRef.current?.resetFields();
  });
  expect(model.name).toBe('Original');

});
