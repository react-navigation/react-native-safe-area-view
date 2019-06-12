import React, { Component } from 'react';
import { Animated } from 'react-native';

import useSafeArea from './useSafeArea.web';

export default function SafeView(props) {
  const { forceInset = false, ...inputProps } = props;

  const safeArea = useSafeArea();
  return (
    <Animated.View
      ref={view}
      pointerEvents="box-none"
      {...inputProps}
      style={[style, safeArea]}
    />
  );
}

SafeView.setStatusBarHeight = () => {
  // no-op
};
