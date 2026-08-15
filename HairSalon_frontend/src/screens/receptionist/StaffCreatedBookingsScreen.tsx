import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { Booking } from '../../types/booking';
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from '../../constants/bookingStatus';

export const StaffCreatedBookingsScreen = ({ navigation }: any) => {
  const theme = useTheme();

  const { data: staffBookings, isLoading, refetch } = useQuery({
    queryKey: ['staffCreatedBookings'],
    queryFn: () => bookingService.getStaffCreatedBookings(),
  });

  if (isLoading) {
    return <LoadingOverlay message="Loading staff created appointments..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Staff Created Appointments" />
      </Appbar.Header>

      <FlatList
        data={staffBookings || []}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={
          (staffBookings || []).length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-account"
            title="No Staff Created Bookings"
            description="No walk-in or phone call appointments have been recorded by receptionists yet."
          />
        }
        renderItem={({ item }: { item: Booking }) => {
          const statusColor = BOOKING_STATUS_COLORS[item.status] || '#757575';
          return (
            <Card mode="outlined" style={styles.card}>
              <Card.Title
                title={`Ref: ${item.bookingCode}`}
                subtitle={`Created: ${item.createdAt}`}
                right={() => (
                  <Chip
                    compact
                    style={{
                      backgroundColor: statusColor + '20',
                      marginRight: 16,
                    }}
                    textStyle={{ color: statusColor, fontWeight: 'bold' }}
                  >
                    {BOOKING_STATUS_LABELS[item.status]}
                  </Chip>
                )}
              />
              <Card.Content>
                <View style={styles.tagRow}>
                  <Chip
                    icon="clock-outline"
                    compact
                    style={{ backgroundColor: theme.colors.secondaryContainer }}
                  >
                    {item.bookingDate} • {item.timeSlot}
                  </Chip>

                  <Chip
                    icon={item.creationType === 'Walk-in' ? 'walk' : 'phone'}
                    compact
                  >
                    {item.creationType || 'Walk-in'}
                  </Chip>

                  <Chip icon="account-tie" compact>
                    Stylist: {item.stylistName}
                  </Chip>
                </View>

                <Text variant="titleMedium" style={styles.name}>
                  Customer: {item.customerName} ({item.customerPhone})
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
                  Total Amount: ${item.totalAmount}
                </Text>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    marginRight: 8,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 4,
  },
});
