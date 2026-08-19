import { Platform } from 'react-native';

export const ENV = {
  USE_MOCK_DATA: false,
  // Backend Spring Boot runs on port 8081 (Metro Bundler runs on port 8082)
  API_BASE_URL: Platform.OS === 'android' ? 'http://10.0.2.2:8081/api' : 'http://localhost:8081/api',
  ARTIFICIAL_DELAY_MS: 500,
};



