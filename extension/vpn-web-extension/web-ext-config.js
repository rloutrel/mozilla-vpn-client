/* eslint-env node */

const defaultConfig = {
  // Global options:
  artifactsDir: 'dist/',
  ignoreFiles: ['.DS_Store'],
  // Command options:
  build: {
    overwriteDest: true,
  },
  run: {
    browserConsole: true,
    startUrl: ['about:debugging'],
  },
};

module.exports = defaultConfig;
