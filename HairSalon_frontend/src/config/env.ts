import { Platform } from 'react-native';

export const ENV = {
  USE_MOCK_DATA: false,
  // Dùng 10.0.2.2 cho Android Emulator, localhost cho iOS Simulator
  API_BASE_URL: Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api',
  ARTIFICIAL_DELAY_MS: 500,
};
