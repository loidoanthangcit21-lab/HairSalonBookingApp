import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Avatar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CashierTodayBookingsScreen } from '../screens/cashier/CashierTodayBookingsScreen';
import { StaffBookingFormScreen } from '../screens/cashier/StaffBookingFormScreen';
import { StaffCreatedBookingsScreen } from '../screens/cashier/StaffCreatedBookingsScreen';
import { ProcessPaymentScreen } from '../screens/cashier/ProcessPaymentScreen';

import { BrowseServicesScreen } from '../screens/customer/BrowseServicesScreen';
import { BrowseStylistsScreen } from '../screens/customer/BrowseStylistsScreen';
import { ViewProfileScreen } from '../screens/auth/ViewProfileScreen';
import { UpdateProfileScreen } from '../screens/auth/UpdateProfileScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';
import { NotificationPanelScreen } from '../screens/auth/NotificationPanelScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const CashierTabs = () => {
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
          let iconName = 'calendar-today';
          if (route.name === 'QueueTab') iconName = 'calendar-multiselect';
          else if (route.name === 'WalkinTab') iconName = 'calendar-plus';
          else if (route.name === 'TrackingTab') iconName = 'clipboard-list';
          else if (route.name === 'ProfileTab') iconName = 'account-circle';

          return <Avatar.Icon size={size || 24} icon={iconName} style={{ backgroundColor: 'transparent' }} color={color} />;
        },
      })}
    >
      <Tab.Screen name="QueueTab" component={CashierTodayBookingsScreen} options={{ tabBarLabel: "Today Queue" }} />
      <Tab.Screen name="WalkinTab" component={StaffBookingFormScreen} options={{ tabBarLabel: 'Walk-in' }} />
      <Tab.Screen name="TrackingTab" component={StaffCreatedBookingsScreen} options={{ tabBarLabel: 'Staff Created' }} />
      <Tab.Screen name="ProfileTab" component={ViewProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const CashierNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CashierMainTabs" component={CashierTabs} />
      <Stack.Screen name="CashierTodayBookings" component={CashierTodayBookingsScreen} />
      <Stack.Screen name="StaffBookingForm" component={StaffBookingFormScreen} />
      <Stack.Screen name="StaffCreatedBookings" component={StaffCreatedBookingsScreen} />
      <Stack.Screen name="BrowseServices" component={BrowseServicesScreen} />
      <Stack.Screen name="BrowseStylists" component={BrowseStylistsScreen} />
      <Stack.Screen name="ProcessPayment" component={ProcessPaymentScreen} />
      <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationPanel" component={NotificationPanelScreen} />
    </Stack.Navigator>

  );
};
