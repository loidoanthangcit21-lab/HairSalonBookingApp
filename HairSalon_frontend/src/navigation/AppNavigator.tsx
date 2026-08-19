import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../store';
import { UserRole } from '../constants/roles';

import { AuthNavigator } from './AuthNavigator';
import { CustomerNavigator } from './CustomerNavigator';
import { CashierNavigator } from './CashierNavigator';
import { useWebSocket } from '../hooks/useWebSocket';

export const AppNavigator = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useWebSocket();

  const renderRoleNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    switch (user?.role) {
      case UserRole.ADMIN:
      case 'ADMIN' as any:
      case 'CASHIER' as any:
        return <CashierNavigator />;
      case UserRole.CUSTOMER:
      default:
        return <CustomerNavigator />;
    }
  };

  return <NavigationContainer>{renderRoleNavigator()}</NavigationContainer>;
};
