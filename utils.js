import { StyleSheet } from 'react-native';

export function doubleFromPercentString(percent) {
  if (!percent.includes('%')) {
    return 0;
  }

  const dbl = parseFloat(percent) / 100;

  if (isNaN(dbl)) return 0;

  return dbl;
}

export function getViewStyles(style, viewWidth) {
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
  } = StyleSheet.flatten(style || {});

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
}
