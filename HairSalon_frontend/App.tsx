import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store, useAppDispatch, useAppSelector } from './src/store';
import { AppDarkTheme, AppLightTheme } from './src/constants/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { storage } from './src/utils/storage';
import { setCredentials } from './src/store/authSlice';
import { setDarkMode } from './src/store/themeSlice';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function MainAppContent() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await storage.getToken();
        const user = await storage.getUser<any>();
        const savedTheme = await storage.getTheme();

        dispatch(setDarkMode(savedTheme));

        if (token && user) {
          dispatch(setCredentials({ token, user }));
        }
      } catch (e) {
        console.error('Bootstrap storage load error:', e);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  const activeTheme = isDarkMode ? AppDarkTheme : AppLightTheme;

  return (
    <PaperProvider theme={activeTheme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={activeTheme.colors.background}
      />
      <AppNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <MainAppContent />
        </QueryClientProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
