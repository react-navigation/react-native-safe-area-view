import { ComponentClass } from 'react';
import { ViewProperties } from 'react-native';

export type SafeAreaViewForceInsetValue = 'always' | 'never';

export interface SafeAreaViewForceInset {
  top?: SafeAreaViewForceInsetValue;
  bottom?: SafeAreaViewForceInsetValue;
  left?: SafeAreaViewForceInsetValue;
  right?: SafeAreaViewForceInsetValue;
  horizontal?: SafeAreaViewForceInsetValue;
  vertical?: SafeAreaViewForceInsetValue;
}

export interface SafeAreaViewProps extends ViewProperties {
  forceInset?: SafeAreaViewForceInset;
}

export const getStatusBarHeight: (isLandscape?: boolean) => number;

export const getInset: (
  key: 'top' | 'right' | 'bottom' | 'left',
  isLandscape?: boolean
) => number;

export const SafeAreaView: ComponentClass<SafeAreaViewProps>;

export const withSafeArea: <P extends object>(
  forceInset?: SafeAreaViewForceInset
) => (
  Component: React.ComponentType<P>
) => React.ComponentType<P>;

export default SafeAreaView;
