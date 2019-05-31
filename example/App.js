import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SafeAreaView from 'react-native-safe-area-view';

export default class App extends React.Component {
  render() {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: 'white' }]}
      >
        <View
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={{ color: 'white' }}>
            Open up App.js to start working on your app!
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
