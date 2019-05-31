// @flow
import hoistNonReactStatic from 'hoist-non-react-statics';
import * as React from 'react';
import { Dimensions } from 'react-native';

type WindowDimensions = {
  width: number,
  height: number,
};

type InjectedProps = {
  isLandscape: boolean,
};

type State = {
  isLandscape: boolean,
};

const query = window.matchMedia('(orientation: landscape)');

export const isOrientationLandscape = (e: WindowDimensions): boolean =>
  query.matches;

export default function<T: {}>(
  WrappedComponent: React.ComponentType<T & InjectedProps>,
) {
  class withOrientation extends React.Component<T, State> {
    constructor() {
      super();

      this.state = { isLandscape: query.matches };
    }

    screenTest = e => {
      this.setState({ isLandscape: e.matches });
    };

    componentDidMount() {
      query.addListener(this.screenTest);
    }

    componentWillUnmount() {
      query.removeListener(this.screenTest);
    }

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  }

  return hoistNonReactStatic(withOrientation, WrappedComponent);
}
