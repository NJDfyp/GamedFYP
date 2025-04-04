module.exports = {
  presets: ['module:@react-native/babel-preset', '@babel/preset-flow'],
  plugins: [
    'babel-plugin-transform-flow-strip-types',
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
};
