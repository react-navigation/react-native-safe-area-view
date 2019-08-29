import React from 'react';
import { View } from 'react-native';

import { EdgeInsets } from 'react-native-safe-area-context';

const defaultInsets: EdgeInsets = { top: 0, bottom: 0, left: 0, right: 0 };

export const SafeAreaContext = React.createContext<EdgeInsets | null>(
  defaultInsets,
);

export const SafeAreaConsumer = SafeAreaContext.Consumer;
export const SafeAreaProvider = SafeAreaContext.Provider;

export function useSafeArea(): EdgeInsets {
  return defaultInsets
};

export default View;
