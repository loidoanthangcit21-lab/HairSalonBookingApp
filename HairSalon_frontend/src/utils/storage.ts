import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: 'AUTH_TOKEN',
  USER: 'AUTH_USER',
  THEME: 'APP_THEME',
};

export const storage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  },
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.TOKEN);
  },
  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.TOKEN);
  },
  async setUser(user: object): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  async getUser<T>(): Promise<T | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? (JSON.parse(data) as T) : null;
  },
  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },
  async setTheme(isDark: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME, isDark ? 'dark' : 'light');
  },
  async getTheme(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.THEME);
    return val === 'dark';
  },
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};
