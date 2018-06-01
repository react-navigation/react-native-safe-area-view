import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';

import SafeAreaView from './';

export default function (forceInset = {}) {
  return (WrappedComponent) => {
    class withSafeArea extends Component {
      render() {
        return (
          <SafeAreaView style={{ flex: 1 }} forceInset={forceInset}>
            <WrappedComponent {...this.props} />;
          </SafeAreaView>
        );
      }
    }

    return hoistStatics(withSafeArea, WrappedComponent);
  };
}
