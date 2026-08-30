import React from 'react';
import { View } from 'react-native';

// Canvas stub for web - canvas functionality not needed for H5 preview
const Canvas = React.forwardRef<any, any>((props, ref) => (
  <View ref={ref} {...props} />
));
Canvas.displayName = 'Canvas';

export const Image = Canvas;
export default Canvas;
