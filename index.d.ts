import { ComponentClass } from 'react'
import { ViewProps } from 'react-native'

export type SafeAreaViewForceInsetValue = 'always' | 'never'

export interface SafeAreaViewProps extends ViewProps {
  forceInset?: {
    top?: SafeAreaViewForceInsetValue
    bottom?: SafeAreaViewForceInsetValue
    left?: SafeAreaViewForceInsetValue
    right?: SafeAreaViewForceInsetValue
    horizontal?: SafeAreaViewForceInsetValue
    vertical?: SafeAreaViewForceInsetValue
  }
}

export const SafeAreaView: ComponentClass<SafeAreaViewProps>

export default SafeAreaView
