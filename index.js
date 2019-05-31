import hoistStatics from 'hoist-non-react-statics';
import React, { Component } from 'react';

import SafeView from './SafeView';
import withOrientation from './withOrientation';

const SafeAreaView = withOrientation(SafeView);

export default SafeAreaView;

export function withSafeArea(forceInset = {}) {
  return WrappedComponent => {
    class withSafeArea extends Component {
      render() {
        return (
          <SafeAreaView style={{ flex: 1 }} forceInset={forceInset}>
            <WrappedComponent {...this.props} />
          </SafeAreaView>
        );
      }
    }

    return hoistStatics(withSafeArea, WrappedComponent);
  };
}
