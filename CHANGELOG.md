# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2020-05-11

### ⚠ BREAKING CHANGES

* `SafeAreaContext` was renamed to `SafeAreaInsetsContext`, corresponding to `react-native-safe-area-context` v1.0.

`useSafeArea` and `SafeAreaConsumer` have been deprecated, but are still available at this time.
See https://github.com/th3rdwave/react-native-safe-area-context/releases/tag/1.0.0

### Added

* Support for `react-native-safe-area-context` 1.0

## [1.1.0]

## Added

- Support for react-native@0.62 (https://github.com/react-native-community/react-native-safe-area-view/pull/110)

## [1.0.0]

First release that handles safe area insets properly on iOS and Android!

## Removed

- `getInset` has been removed. Use the `react-native-safe-area-context` API directly instead.
- `withSafeArea` has been removed. You may want to re-implement this yourself for ease of migration if you used an old version. Once again, use the `react-native-safe-area-context` APIs directly instead.
