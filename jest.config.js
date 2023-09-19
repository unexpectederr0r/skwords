module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns:['ignore'],
    setupFiles: ["./test.setup.js"],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transformIgnorePatterns: [
      'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-navigation/.*|@unimodules/.*|expo|expo-.*|@sentry/.*|native-base|@react-native-firebase/.*|src/firebase|dist/src/firebase|firebase|@firebase|@react-native-async-storage/async-storage/.*|react-native-async-storage/.*|react-native-community/.*|franc-min|franc-min/.*|franc|trigram-utils|trigram-utils/.*|n-gram|n-gram/.*|collapse-white-space|collapse-white-space/.*|react-native-gesture-handler|react-native-gesture-handler/.*|react-navigation|react-navigation/.*|react-navigation/.*|react-navigation|react-native-element-dropdown|react-native-element-dropdown/.*)',      
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
  };
  
