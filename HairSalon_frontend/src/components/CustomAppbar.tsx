import React from 'react';
import { Appbar } from 'react-native-paper';

interface CustomAppbarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  actions?: React.ReactNode;
}

export const CustomAppbar: React.FC<CustomAppbarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  actions,
}) => {
  return (
    <Appbar.Header elevated>
      {showBack && <Appbar.BackAction onPress={onBackPress} />}
      <Appbar.Content title={title} subtitle={subtitle} />
      {actions}
    </Appbar.Header>
  );
};
