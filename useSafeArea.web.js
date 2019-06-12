import * as React from 'react';

function getSupportedTransitionEvent() {
  const el = document.createElement('invalidtype');
  const transitions = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    MSTransition: 'msTransitionEnd',
    OTransition: 'oTransitionEnd',
    transition: 'transitionEnd',
  };

  for (const t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
}
const eventName = getSupportedTransitionEvent();

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

const env = getSupportedEnv();
function getInset(side) {
  return `${env}(safe-area-inset-${side})`;
}

function setStyle({ style: elStyle }, style) {
  for (const key of Object.keys(style)) {
    const val = style[key];
    elStyle[key] = val;
  }
}

const paddingAttributes = [
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
];

export default function useSafeArea() {
  const parentDiv = document.createElement('div');
  setStyle(parentDiv, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '0',
    height: '0',
    zIndex: '-1',
    overflow: 'hidden',
    visibility: 'hidden',
    transitionDuration: '0.01s',
    transitionProperty: 'padding',
    transitionDelay: '0s',
    paddingTop: getInset('top'),
    paddingBottom: getInset('bottom'),
    paddingLeft: getInset('left'),
    paddingRight: getInset('right'),
  });
  document.body.appendChild(parentDiv);

  function getInsets() {
    let insets = {};
    const style = getComputedStyle(parentDiv);
    for (const attr of paddingAttributes) {
      insets[attr] = parseInt(style[attr], 10);
    }
    return insets;
  }

  const [insets, setInset] = React.useState(getInsets());

  React.useEffect(() => {
    const onEnd = e => {
      setInset(getInsets());
    };
    parentDiv.addEventListener(eventName, onEnd);
    return () => {
      document.body.removeChild(parentDiv);
      parentDiv.removeEventListener(eventName, onEnd);
    };
  }, []);

  return insets;
}
