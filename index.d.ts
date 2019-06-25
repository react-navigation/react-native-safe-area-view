import { ComponentClass } from 'react';
import { ViewProperties } from 'react-native';

export type SafeAreaViewForceInsetValue = 'always' | 'never';

export interface SafeAreaViewProps extends ViewProperties {
  forceInset?: {
    top?: SafeAreaViewForceInsetValue;
    bottom?: SafeAreaViewForceInsetValue;
    left?: SafeAreaViewForceInsetValue;
    right?: SafeAreaViewForceInsetValue;
    horizontal?: SafeAreaViewForceInsetValue;
    vertical?: SafeAreaViewForceInsetValue;
  };
}

export const getStatusBarHeight: (isLandscape?: boolean) => number;

export const setStatusBarHeight: (height: number) => void;

export const setStatusBarHidden: (hidden: boolean) => void;

export const getInset: (
  key: 'top' | 'right' | 'bottom' | 'left',
  isLandscape?: boolean
) => number;

export const SafeAreaView: ComponentClass<SafeAreaViewProps>;

export const withSafeArea: <P extends object>(
  safeAreaViewProps?: SafeAreaViewProps
) => (
  Component: React.ComponentType<P>
) => React.ComponentType<P & SafeAreaViewProps>;

export default SafeAreaView;
