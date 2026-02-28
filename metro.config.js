/**
 * Metro configuration for React Native
 * @format
 */
const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },

  resolver: {
    // RN 0.61 + older Metro can choke on ESM builds from some packages
    // (e.g. @react-navigation/* lib/module). Prefer CommonJS entrypoints.
    resolverMainFields: ['main', 'react-native', 'browser'],
    blacklistRE: blacklist([
      /android\/app\/build\/.*/,
      /android\/build\/.*/,
      /android\/\.gradle\/.*/,
    ]),
  },
};
