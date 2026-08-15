import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Avatar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StylistAssignedJobsScreen } from '../screens/stylist/StylistAssignedJobsScreen';
import { StylistJobDetailScreen } from '../screens/stylist/StylistJobDetailScreen';

import { ViewProfileScreen } from '../screens/auth/ViewProfileScreen';
import { UpdateProfileScreen } from '../screens/auth/UpdateProfileScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';
import { NotificationPanelScreen } from '../screens/auth/NotificationPanelScreen';
import { SettingsScreen } from '../screens/auth/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StylistTabs = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 14;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'content-cut';
          if (route.name === 'JobsTab') iconName = 'scissors-cutting';
          else if (route.name === 'ProfileTab') iconName = 'account-circle';

          return <Avatar.Icon size={size || 24} icon={iconName} style={{ backgroundColor: 'transparent' }} color={color} />;
        },
      })}
    >
      <Tab.Screen name="JobsTab" component={StylistAssignedJobsScreen} options={{ tabBarLabel: 'Assigned Jobs' }} />
      <Tab.Screen name="ProfileTab" component={ViewProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const StylistNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StylistMainTabs" component={StylistTabs} />
      <Stack.Screen name="StylistAssignedJobs" component={StylistAssignedJobsScreen} />
      <Stack.Screen name="StylistJobDetail" component={StylistJobDetailScreen} />
      <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationPanel" component={NotificationPanelScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
