import * as React from 'react';
import {
  Animated,
  Dimensions,
  InteractionManager,
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewStyle,
  ViewProperties,
} from 'react-native';
import {
  EdgeInsets,
  SafeAreaContext,
  SafeAreaProvider,
  SafeAreaConsumer,
  useSafeArea,
} from 'react-native-safe-area-context';

import shallowEquals from './shallowEquals';

// Re-export react-native-safe-area-context utilities
export { useSafeArea, SafeAreaProvider, SafeAreaConsumer, SafeAreaContext };

export type ForceInsetValue = 'always' | 'never';
export type ForceInsetProp = {
  top?: ForceInsetValue;
  bottom?: ForceInsetValue;
  left?: ForceInsetValue;
  right?: ForceInsetValue;
  horizontal?: ForceInsetValue;
  vertical?: ForceInsetValue;
};

interface Props extends ViewProperties {
  forceInset?: ForceInsetProp;
}

interface State {
  touchesTop: boolean;
  touchesBottom: boolean;
  touchesLeft: boolean;
  touchesRight: boolean;
  viewWidth: number;
  viewHeight: number;
}

// https://github.com/facebook/react-native/blob/282b8b04e167cb426e40947064c4c18186e093f5/Libraries/ReactNative/DummyUIManager.js#L64
interface AnimatedView extends Animated.AnimatedComponent<View> {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
}

export default class SafeAreaView extends React.Component<Props, State> {
  static contextType: any = SafeAreaContext;
  context!: React.ContextType<typeof SafeAreaContext>;
  private _isMounted: boolean = false;
  private _view = React.createRef<AnimatedView>();

  state: State = {
    touchesTop: true,
    touchesBottom: true,
    touchesLeft: true,
    touchesRight: true,
    viewWidth: 0,
    viewHeight: 0,
  };

  componentDidMount() {
    this._isMounted = true;
    InteractionManager.runAfterInteractions(() => {
      this._updateMeasurements();
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { forceInset = false, style, ...props } = this.props;

    return (
      <Animated.View
        // @ts-ignore
        ref={this._view}
        pointerEvents="box-none"
        {...props}
        onLayout={this._handleLayout}
        style={this._getSafeAreaStyle()}
      />
    );
  }

  _handleLayout = (e: LayoutChangeEvent) => {
    if (this.props.onLayout) this.props.onLayout(e);

    this._updateMeasurements();
  };

  _updateMeasurements = () => {
    if (!this._isMounted) return;
    if (!this._view.current) return;

    const { width: WIDTH, height: HEIGHT } = getResolvedDimensions();

    // calling getNode on the ref is no longer necessary in the future
    const view = this._view.current.measureInWindow
      ? this._view.current
      : this._view.current.getNode();
    view.measureInWindow((realX, realY, winWidth, winHeight) => {
      if (!this._view.current) {
        return;
      }

      if (realY >= HEIGHT) {
        realY = realY % HEIGHT;
      } else if (realY < 0) {
        realY = (realY % HEIGHT) + HEIGHT;
      }

      if (realX >= WIDTH) {
        realX = realX % WIDTH;
      } else if (realX < 0) {
        realX = (realX % WIDTH) + WIDTH;
      }

      let nextState = {
        touchesTop: realY === 0,
        touchesBottom: realY + winHeight >= HEIGHT,
        touchesLeft: realX === 0,
        touchesRight: realX + winWidth >= WIDTH,
        viewWidth: winWidth,
        viewHeight: winHeight,
      };

      if (!shallowEquals(nextState, this.state)) {
        this.setState(nextState);
      }
    });
  };

  _getSafeAreaStyle = () => {
    const { touchesTop, touchesBottom, touchesLeft, touchesRight } = this.state;
    const { forceInset } = this.props;

    const {
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      viewStyle,
    } = this._getViewStyles();

    const style = {
      ...viewStyle,
      paddingTop: touchesTop ? this._getInset('top') : 0,
      paddingBottom: touchesBottom ? this._getInset('bottom') : 0,
      paddingLeft: touchesLeft ? this._getInset('left') : 0,
      paddingRight: touchesRight ? this._getInset('right') : 0,
    };

    if (forceInset && typeof forceInset !== 'boolean') {
      getKeys(forceInset).forEach(key => {
        let inset = 0;

        if (forceInset[key] === 'always') {
          inset = this._getInset(key);
        } else if (forceInset[key] === 'never') {
          inset = 0;
        }

        switch (key) {
          case 'horizontal': {
            style.paddingLeft = inset;
            style.paddingRight = inset;
            break;
          }
          case 'vertical': {
            style.paddingTop = inset;
            style.paddingBottom = inset;
            break;
          }
          case 'left': {
            style.paddingLeft = inset;
            break;
          }
          case 'right': {
            style.paddingRight = inset;
            break;
          }
          case 'top': {
            style.paddingTop = inset;
            break;
          }
          case 'bottom': {
            style.paddingBottom = inset;
            break;
          }
        }
      });
    }

    // new height/width should only include padding from insets
    // height/width should not be affected by padding from style obj
    if (style.height && typeof style.height === 'number') {
      style.height += style.paddingTop + style.paddingBottom;
    }

    if (style.width && typeof style.width === 'number') {
      style.width += style.paddingLeft + style.paddingRight;
    }

    style.paddingTop = Math.max(style.paddingTop, paddingTop);
    style.paddingBottom = Math.max(style.paddingBottom, paddingBottom);
    style.paddingLeft = Math.max(style.paddingLeft, paddingLeft);
    style.paddingRight = Math.max(style.paddingRight, paddingRight);

    return style;
  };

  _getViewStyles = () => {
    const { viewWidth } = this.state;
    // get padding values from style to add back in after insets are determined
    // default precedence: padding[Side] -> vertical | horizontal -> padding -> 0
    let {
      padding = 0,
      paddingVertical = padding,
      paddingHorizontal = padding,
      paddingTop = paddingVertical,
      paddingBottom = paddingVertical,
      paddingLeft = paddingHorizontal,
      paddingRight = paddingHorizontal,
      ...viewStyle
    }: ViewStyle = StyleSheet.flatten(this.props.style || {});

    if (typeof paddingTop !== 'number') {
      paddingTop = doubleFromPercentString(paddingTop) * viewWidth;
    }

    if (typeof paddingBottom !== 'number') {
      paddingBottom = doubleFromPercentString(paddingBottom) * viewWidth;
    }

    if (typeof paddingLeft !== 'number') {
      paddingLeft = doubleFromPercentString(paddingLeft) * viewWidth;
    }

    if (typeof paddingRight !== 'number') {
      paddingRight = doubleFromPercentString(paddingRight) * viewWidth;
    }

    return {
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      viewStyle,
    };
  };

  _getInset = (key: keyof ForceInsetProp) => {
    if (this.context === null) {
      throw new Error(
        '<SafeAreaView /> must be wrapped by react-native-safe-area-context <SafeAreaProvider />'
      );
    } else if (key === 'horizontal') {
      return Math.max(this.context.left, this.context.right);
    } else if (key === 'vertical') {
      return Math.max(this.context.top, this.context.bottom);
    } else {
      return this.context[key as keyof EdgeInsets];
    }
  };
}

// note(brentvatne): it is unclear to me why this function exists but I will
// leave it
function getResolvedDimensions() {
  const { width, height } = Dimensions.get('window');
  if (width === 0 && height === 0) return Dimensions.get('screen');
  return { width, height };
}

// Convert percentage string, eg: 50%, to double, eg: 0.5
function doubleFromPercentString(percent: string): number {
  if (!percent.includes('%')) {
    return 0;
  }

  const dbl = parseFloat(percent) / 100;

  if (isNaN(dbl)) return 0;

  return dbl;
}

// Utility to iterate over keys in object and have each key typed
function getKeys<T extends {}>(object: T): Array<keyof T> {
  return Object.keys(object) as Array<keyof T>;
}
