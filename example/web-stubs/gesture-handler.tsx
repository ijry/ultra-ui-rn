import React from 'react';
import { View } from 'react-native';

// GestureHandlerRootView is just a View wrapper on web
export const GestureHandlerRootView = View;
export default View;

// Common gesture components - stubs for web
export const PanGestureHandler = View;
export const TapGestureHandler = View;
export const LongPressGestureHandler = View;
export const FlingGestureHandler = View;
export const PinchGestureHandler = View;
export const RotationGestureHandler = View;
export const ForceTouchGestureHandler = View;

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

export const Gesture = {
  Pan: () => ({ }),
  Tap: () => ({ }),
  LongPress: () => ({ }),
};
