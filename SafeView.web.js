import React, { Component } from 'react';
import { Animated } from 'react-native';

import useSafeArea from './useSafeArea.web';

export default function SafeView({ forceInset = false, style, ...props }) {
  const safeAreaStyle = useSafeArea();
  return (
    <Animated.View
      pointerEvents="box-none"
      {...props}
      style={[style, safeAreaStyle]}
    />
  );
}

SafeView.setStatusBarHeight = () => {
  // no-op
};
