import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../store';
import { UserRole } from '../constants/roles';

import { AuthNavigator } from './AuthNavigator';
import { CustomerNavigator } from './CustomerNavigator';
import { ReceptionistNavigator } from './ReceptionistNavigator';
import { StylistNavigator } from './StylistNavigator';

export const AppNavigator = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const renderRoleNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    switch (user.role) {
      case UserRole.RECEPTIONIST:
        return <ReceptionistNavigator />;
      case UserRole.STYLIST:
        return <StylistNavigator />;
      case UserRole.CUSTOMER:
      default:
        return <CustomerNavigator />;
    }
  };

  return <NavigationContainer>{renderRoleNavigator()}</NavigationContainer>;
};
