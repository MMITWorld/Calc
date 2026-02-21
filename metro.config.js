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
    blacklistRE: blacklist([
      /android\/app\/build\/.*/,
      /android\/build\/.*/,
      /android\/\.gradle\/.*/,
    ]),
  },
};
