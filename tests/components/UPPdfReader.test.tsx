import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { UPPdfReader, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders a placeholder with the src when no renderPdf is injected', () => {
  const screen = renderRoot(<UPPdfReader src="https://example.com/doc.pdf" />);
  expect(screen.getByTestId('up-pdf-reader-placeholder')).toHaveTextContent(/doc\.pdf/);
});

it('shows an empty hint without src', () => {
  const screen = renderRoot(<UPPdfReader />);
  expect(screen.getByTestId('up-pdf-reader-placeholder')).toHaveTextContent(/未提供 src/);
});

it('uses the injected renderPdf slot', () => {
  const screen = renderRoot(
    <UPPdfReader renderPdf={({ src }) => <View testID="custom-pdf">{src}</View>} src="https://example.com/a.pdf" />,
  );
  expect(screen.getByTestId('custom-pdf')).toHaveTextContent(/a\.pdf/);
});
