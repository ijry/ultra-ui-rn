import React from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  UPAlert,
  UPAvatarGroup,
  UPCollapse,
  UPCollapseItem,
  UPLink,
  UPRoot,
  UPSteps,
  UPStepsItem,
  UPSubsection,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('opens source links and preserves the source click callback', () => {
  jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(true);
  const onClick = jest.fn();
  const screen = renderRoot(<UPLink href="https://uviewui.com" onClick={onClick} text="uView" underLine />);

  fireEvent.press(screen.getByTestId('up-link'));
  expect(Linking.openURL).toHaveBeenCalledWith('https://uviewui.com');
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('closes controlled source alerts and overlays avatar-group overflow', () => {
  const onClose = jest.fn();
  const onUpdateModelValue = jest.fn();
  const onShowMore = jest.fn();
  const screen = renderRoot(
    <>
      <UPAlert
        closable
        description="Details"
        modelValue
        onClose={onClose}
        onUpdateModelValue={onUpdateModelValue}
        showIcon
        title="Warning"
      />
      <UPAvatarGroup
        maxCount={2}
        onShowMore={onShowMore}
        urls={['https://example.com/one.png', 'https://example.com/two.png', 'https://example.com/three.png']}
      />
    </>,
  );

  fireEvent.press(screen.getByTestId('up-alert-close'));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onUpdateModelValue).toHaveBeenCalledWith(false);
  fireEvent.press(screen.getByTestId('up-avatar-group-more'));
  expect(onShowMore).toHaveBeenCalledTimes(1);
});

it('maps source subsection item keys, active colors, and controlled callbacks', () => {
  const onChange = jest.fn();
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(
    <UPSubsection
      activeColor="#123456"
      current={0}
      list={[{ label: 'First' }, { label: 'Second' }]}
      keyName="label"
      mode="subsection"
      onChange={onChange}
      onUpdateCurrent={onUpdateCurrent}
    />,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-subsection-item-0-text').props.style)).toEqual(
    expect.objectContaining({ color: '#ffffff' }),
  );
  fireEvent.press(screen.getByTestId('up-subsection-item-1'));
  expect(onChange).toHaveBeenCalledWith(1);
  expect(onUpdateCurrent).toHaveBeenCalledWith(1);
});

it('reports source multi-collapse name and status payloads', () => {
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPCollapse onChange={onChange} value={[]}>
      <UPCollapseItem name="a" title="First"><Text>First body</Text></UPCollapseItem>
      <UPCollapseItem name="b" title="Second"><Text>Second body</Text></UPCollapseItem>
    </UPCollapse>,
  );

  fireEvent.press(screen.getByTestId('up-collapse-item-a'));
  expect(onChange).toHaveBeenLastCalledWith([
    { name: 'a', status: 'open' },
    { name: 'b', status: 'close' },
  ]);
  fireEvent.press(screen.getByTestId('up-collapse-item-b'));
  expect(onChange).toHaveBeenLastCalledWith([
    { name: 'a', status: 'open' },
    { name: 'b', status: 'open' },
  ]);
});

it('renders source steps status precedence for finish, process, error, and wait', () => {
  const screen = renderRoot(
    <UPSteps current={1} direction="row">
      <UPStepsItem title="Finished" />
      <UPStepsItem error title="Failed" />
      <UPStepsItem title="Waiting" />
    </UPSteps>,
  );

  expect(screen.getByTestId('up-steps-item-0-finish')).toBeTruthy();
  expect(screen.getByTestId('up-steps-item-1-error')).toBeTruthy();
  expect(screen.getByTestId('up-steps-item-2-wait')).toBeTruthy();
});
