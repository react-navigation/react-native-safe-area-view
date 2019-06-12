// @flow
import * as React from 'react';

type WindowDimensions = {
  width: number,
  height: number,
};

export default function<T: {}>(
  WrappedComponent: React.ComponentType<T & InjectedProps>,
) {
  // no-op
  return WrappedComponent;
}
