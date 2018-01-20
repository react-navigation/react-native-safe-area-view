# react-native-safe-area-view

This is a JS-only version of SafeAreaView that will be available in React Native v0.50.0, to be released at the beginning of November. This version also adds a small api that makes SafeAreaView more flexible for complex UIs. React Navigation already includes and uses this view starting in [v1.0.0-beta.16](https://github.com/react-community/react-navigation/releases/tag/v1.0.0-beta.16).

## Usage

Wrap components that touch any edge of the screen with SafeAreaView. 

```jsx
<SafeAreaView>
  <View>
    <Text>Look, I'm safe!</Text>
  </View>
</SafeAreaView>
```

### forceInset

Sometimes you will observe unexpected behavior and jank because SafeAreaView uses `onLayout` then calls `measureInWindow` on the view. If you know your view will touch certain edges, use `forceInset` to force it to apply the inset padding on the view. 

```jsx
<SafeAreaView forceInset={{ top: 'always' }}>
  <View>
    <Text>Yeah, I'm safe too!</Text>
  </View>
</SafeAreaView>
```

`forceInset` takes an object with the keys `top | bottom | left | right | vertical | horizontal` and the values `'always' | 'never'`. Or you can override the padding altogether by passing an integer.
