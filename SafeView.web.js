import * as React from 'react';
import {
  View,
  InteractionManager,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import { doubleFromPercentString } from './utils';
// https://github.com/zhetengbiji/safeAreaInsets/blob/master/src/index.ts
const attrs = ['top', 'left', 'right', 'bottom'];

function getSupportedEnv() {
  const { CSS } = window;
  if (
    CSS &&
    CSS.supports &&
    CSS.supports('top: constant(safe-area-inset-top)')
  ) {
    return 'constant';
  }
  return 'env';
}

function getPassiveEvents() {
  let passiveEvents = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        passiveEvents = { passive: true };
      },
    });
    window.addEventListener('test', null, opts);
  } catch (e) {}

  return passiveEvents;
}

function setStyle({ style: elStyle }, style) {
  for (const key of Object.keys(style)) {
    const val = style[key];
    elStyle[key] = val;
  }
}

const passiveEvents = getPassiveEvents();

export default class SafeView extends React.Component {
  static setStatusBarHeight = height => {
    console.warn('SafeView.setStatusBarHeight() is not supported on web');
    _customStatusBarHeight = height;
  };
  inited;
  elementComputedStyle = {};
  changeAttrs = [];
  callbacks = [];
  parentDiv;

  constructor(props) {
    super(props);

    this.state = {
      touchesTop: true,
      touchesBottom: true,
      touchesLeft: true,
      touchesRight: true,
      orientation: null,
      viewWidth: 0,
      viewHeight: 0,
      top: this.getAttr('top'),
      left: this.getAttr('left'),
      bottom: this.getAttr('bottom'),
      right: this.getAttr('right'),
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.callbacks.push(layout => {
      this.setState(() => ({ ...layout }));
    });
    InteractionManager.runAfterInteractions(() => {
      this._onLayout();
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.parentDiv) {
      document.body.removeChild(this.parentDiv);
    }
  }

  componentWillReceiveProps() {
    this._onLayout();
  }

  _onLayout = (...args) => {
    if (!this._isMounted) return;
    if (!this.view) return;

    const { isLandscape } = this.props;
    const { orientation } = this.state;
    const newOrientation = isLandscape ? 'landscape' : 'portrait';
    if (orientation && orientation === newOrientation) {
      return;
    }

    const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

    this.view._component.measureInWindow((winX, winY, winWidth, winHeight) => {
      if (!this.view) {
        return;
      }
      let realY = winY;
      let realX = winX;

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

      const touchesTop = realY === 0;
      const touchesBottom = realY + winHeight >= HEIGHT;
      const touchesLeft = realX === 0;
      const touchesRight = realX + winWidth >= WIDTH;

      this.setState({
        touchesTop,
        touchesBottom,
        touchesLeft,
        touchesRight,
        orientation: newOrientation,
        viewWidth: winWidth,
        viewHeight: winHeight,
      });

      if (this.props.onLayout) {
        this.props.onLayout(...args);
      }
    });
  };

  cbs = [];
  parentReady = callback => {
    if (callback) {
      this.cbs.push(callback);
    } else {
      this.cbs.forEach(cb => {
        cb();
      });
    }
  };

  addChild = (parent, attr) => {
    const support = getSupportedEnv();

    const a1 = document.createElement('div');
    const a2 = document.createElement('div');
    const a1Children = document.createElement('div');
    const a2Children = document.createElement('div');
    const W = 100;
    const MAX = 10000;
    const aStyle = {
      position: 'absolute',
      width: `${W}px`,
      height: '200px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      paddingBottom: `${support}(safe-area-inset-${attr})`,
    };
    setStyle(a1, aStyle);
    setStyle(a2, aStyle);
    setStyle(a1Children, {
      transition: '0s',
      animation: 'none',
      width: '400px',
      height: '400px',
    });
    setStyle(a2Children, {
      transition: '0s',
      animation: 'none',
      width: '250%',
      height: '250%',
    });
    a1.appendChild(a1Children);
    a2.appendChild(a2Children);
    parent.appendChild(a1);
    parent.appendChild(a2);

    this.parentReady(() => {
      a1.scrollTop = a2.scrollTop = MAX;
      let a1LastScrollTop = a1.scrollTop;
      let a2LastScrollTop = a2.scrollTop;
      const onScroll = () => {
        if (
          this.scrollTop === (this === a1 ? a1LastScrollTop : a2LastScrollTop)
        ) {
          return;
        }
        a1.scrollTop = a2.scrollTop = MAX;
        a1LastScrollTop = a1.scrollTop;
        a2LastScrollTop = a2.scrollTop;
        this.attrChange(attr);
      };
      a1.addEventListener('scroll', onScroll, passiveEvents);
      a2.addEventListener('scroll', onScroll, passiveEvents);
    });

    const computedStyle = getComputedStyle(a1);
    Object.defineProperty(this.elementComputedStyle, attr, {
      configurable: true,
      get() {
        return parseFloat(computedStyle.paddingBottom);
      },
    });
  };

  getAttr = attr => {
    if (!this.inited) {
      this.init();
    }
    return this.elementComputedStyle[attr];
  };

  init = () => {
    if (this.inited) return;

    const support = getSupportedEnv();
    if (!support) {
      attrs.forEach(attr => {
        this.elementComputedStyle[attr] = 0;
      });
      this.inited = true;
      return;
    }

    this.parentDiv = document.createElement('div');
    setStyle(this.parentDiv, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '0',
      height: '0',
      zIndex: '-1',
      overflow: 'hidden',
      visibility: 'hidden',
    });
    attrs.forEach(key => {
      this.addChild(this.parentDiv, key);
    });
    document.body.appendChild(this.parentDiv);
    this.parentReady();
    this.inited = true;
  };

  attrChange = attr => {
    if (!this.changeAttrs.length) {
      setTimeout(() => {
        const style = {};
        this.changeAttrs.forEach(attr => {
          style[attr] = this.elementComputedStyle[attr];
        });
        this.changeAttrs.length = 0;
        this.callbacks.forEach(callback => {
          callback(style);
        });
      }, 0);
    }
    this.changeAttrs.push(attr);
  };

  _getInset = key => {
    switch (key) {
      case 'horizontal':
        return this.state.left;
      case 'vertical':
        return this.state.top;
      case 'right':
      case 'left':
      case 'top':
      case 'bottom':
        return this.state[key];
    }
  };

  _getSafeAreaStyle = () => {
    const { touchesTop, touchesBottom, touchesLeft, touchesRight } = this.state;
    const { forceInset, isLandscape } = this.props;

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

    if (forceInset) {
      Object.keys(forceInset).forEach(key => {
        let inset = forceInset[key];

        if (inset === 'always') {
          inset = this._getInset(key);
        }

        if (inset === 'never') {
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
          case 'left':
          case 'right':
          case 'top':
          case 'bottom': {
            const padding = `padding${key[0].toUpperCase()}${key.slice(1)}`;
            style[padding] = inset;
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
    } = StyleSheet.flatten(this.props.style || {});

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

  render() {
    const { forceInset = false, isLandscape, style, ...props } = this.props;

    const safeAreaStyle = this._getSafeAreaStyle();
    return (
      <Animated.View
        ref={c => (this.view = c)}
        pointerEvents="box-none"
        {...props}
        onLayout={this._onLayout}
        style={safeAreaStyle}
      />
    );
  }
}
