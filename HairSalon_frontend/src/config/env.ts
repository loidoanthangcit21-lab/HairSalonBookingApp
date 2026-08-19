import { Platform } from 'react-native';

export const ENV = {
  USE_MOCK_DATA: false,
  API_BASE_URL: Platform.OS === 'android' ? 'http://10.0.2.2:8081/api' : 'http://localhost:8081/api',
  ARTIFICIAL_DELAY_MS: 500,
};



