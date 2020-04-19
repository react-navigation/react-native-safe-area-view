/* eslint-disable import/no-extraneous-dependencies, import/no-commonjs */

const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');
const project = require('../package.json');
const escape = require('escape-string-regexp');

module.exports = {
  watchFolders: [path.resolve(__dirname, '..')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    blacklistRE: blacklist([
      // Ignore the version of the package installed in node_modules
      new RegExp(
        `^${escape(
          path.resolve(__dirname, 'node_modules', project.name)
        )}\\/.*$`
      ),
      // Ignore the parent node_modules
      new RegExp(
        `^${escape(path.resolve(__dirname, '..', 'node_modules'))}\\/.*$`
      ),
    ]),

    extraNodeModules: {
      react: `${__dirname}/node_modules/react`,
      'react-native': `${__dirname}/node_modules/react-native`,
      '@babel/runtime': `${__dirname}/node_modules/@babel/runtime`,
      'react-native-safe-area-context': `${__dirname}/node_modules/react-native-safe-area-context`,
    },
  },
};
