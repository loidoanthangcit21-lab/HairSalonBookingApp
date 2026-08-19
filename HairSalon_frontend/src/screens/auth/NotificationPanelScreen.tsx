import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Badge,
  Card,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { NotificationItem } from '../../types/user';

export const NotificationPanelScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const queryClient = useQueryClient();

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications(),
    refetchInterval: 5000,
  });





  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => userService.markNotificationAsRead(id),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['notifications'], (old: NotificationItem[] | undefined) => {
        if (!old) return old;
        return old.map((n) => (n.id === variables ? { ...n, read: true } : n));
      });
    },
  });

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const unreadItems = (notifications || []).filter((n) => !n.read);
    unreadItems.forEach((n) => markAsReadMutation.mutate(n.id));
  };

  const handlePress = (item: NotificationItem) => {
    if (!item.read) {
      markAsReadMutation.mutate(item.id);
    }
  };

  const filteredList = (notifications || []).filter((item) =>
    filter === 'unread' ? !item.read : true
  );

  if (isLoading && !notifications) {
    return <LoadingOverlay message="Loading notifications..." />;
  }


  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notifications" />
        {unreadCount > 0 && (
          <Appbar.Action icon="check-all" onPress={markAllAsRead} />
        )}
      </Appbar.Header>


      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(val) => setFilter(val as 'all' | 'unread')}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
          ]}
        />
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={
          filteredList.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={
          <EmptyState
            icon="bell-off-outline"
            title="No Notifications"
            description="You are all caught up! Check back later for appointment updates."
          />
        }
        renderItem={({ item }: { item: NotificationItem }) => (
          <Card mode="elevated" style={styles.card} onPress={() => handlePress(item)}>
            <Card.Title
              title={item.title}
              subtitle={`${item.message}\n• ${item.timestamp}`}
              subtitleNumberOfLines={3}
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon={item.type === 'promo' ? 'tag' : 'bell'}
                  style={{
                    backgroundColor: !item.read
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  }}
                />
              )}
              right={() =>
                !item.read ? (
                  <View style={{ paddingRight: 16 }}>
                    <Badge size={10} style={{ backgroundColor: theme.colors.primary }} />
                  </View>
                ) : null
              }
            />
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
  },
});
