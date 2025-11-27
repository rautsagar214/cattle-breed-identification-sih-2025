// Mock Expo modules for testing
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
  __esModule: true,
}));

// Suppress Expo winter errors
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal', () => ({}), { virtual: true });

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'cattle-breed-app',
      slug: 'cattle-breed-app',
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock crypto for secure random generation
global.crypto = {
  getRandomValues: function(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }
};
