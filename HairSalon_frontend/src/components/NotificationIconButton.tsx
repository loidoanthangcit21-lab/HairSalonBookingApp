import React from 'react';
import { View } from 'react-native';
import { Appbar, Badge, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

interface NotificationIconButtonProps {
  onPress: () => void;
}

export const NotificationIconButton: React.FC<NotificationIconButtonProps> = ({ onPress }) => {
  const theme = useTheme();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications(),
    refetchInterval: 3000,
  });

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <View style={{ position: 'relative' }}>
      <Appbar.Action icon="bell-outline" onPress={onPress} />
      {unreadCount > 0 && (
        <Badge
          size={18}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: theme.colors.error,
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 10,
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </View>
  );
};
