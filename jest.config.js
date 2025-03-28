module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Allow transformation for react-native and its deeper subdirectories including vendor files.
    "node_modules/(?!(react-native|@react-native|@react-native-async-storage|react-native-svg|react-native/Libraries|react-native/Libraries/vendor)/)"
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
