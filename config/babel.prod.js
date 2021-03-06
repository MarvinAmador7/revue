export default {
  babelrc: false,
  presets: [
    'babel-preset-latest',
    'babel-preset-react',
  ].map(require.resolve),

  plugins: [
    'babel-plugin-add-module-exports',
    'babel-plugin-transform-flow-strip-types',
    'babel-plugin-transform-object-rest-spread',
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-export-extensions',
  ].map(require.resolve)
  .concat([[
    require.resolve('babel-plugin-transform-runtime'),
    {
      helpers: false,
      polyfill: false,
      regenerator: true,
    },
  ]]),
};
