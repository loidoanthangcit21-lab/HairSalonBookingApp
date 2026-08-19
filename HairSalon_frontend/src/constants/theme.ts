import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
    background: '#FEF7FF',
    surface: '#FEF7FF',
    surfaceVariant: '#E7E0EC',
    error: '#B3261E',
  },
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    tertiary: '#EFB8C8',
    background: '#141218',
    surface: '#141218',
    surfaceVariant: '#49454F',
    error: '#F2B8B5',
  },
};
