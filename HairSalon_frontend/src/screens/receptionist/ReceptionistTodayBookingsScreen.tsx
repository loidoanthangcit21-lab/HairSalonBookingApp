import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  FAB,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { Booking } from '../../types/booking';
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BookingStatus,
} from '../../constants/bookingStatus';

export const ReceptionistTodayBookingsScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: todayBookings, isLoading, refetch } = useQuery({
    queryKey: ['todayBookings'],
    queryFn: () => bookingService.getTodayBookings(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingService.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
    },
  });

  const filteredQueue = (todayBookings || []).filter(
    (b) =>
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery)
  );

  if (isLoading) {
    return <LoadingOverlay message="Loading today's queue..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content
          title="Today's Queue & Bookings"
          subtitle={new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        />
        <Appbar.Action
          icon="history"
          onPress={() => navigation.navigate('StaffCreatedBookings')}
        />
      </Appbar.Header>

      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search customer name or booking code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredQueue}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={
          filteredQueue.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-today"
            title="No Bookings Today"
            description="There are currently no scheduled appointments in today's queue."
          />
        }
        renderItem={({ item }: { item: Booking }) => {
          const statusColor = BOOKING_STATUS_COLORS[item.status] || '#757575';
          return (
            <Card mode="elevated" style={styles.card}>
              <Card.Title
                title={`${item.timeSlot} — ${item.customerName}`}
                subtitle={`Phone: ${item.customerPhone} • #${item.bookingCode}`}
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
                <View style={styles.badgeRow}>
                  <Chip
                    icon="clock-outline"
                    compact
                    style={{ backgroundColor: theme.colors.secondaryContainer }}
                  >
                    {item.bookingDate || 'Today'} • {item.timeSlot}
                  </Chip>

                  <Chip icon="account-tie" compact>
                    Stylist: {item.stylistName}
                  </Chip>

                  {item.createdByStaff ? (
                    <Chip icon="account-badge" compact>
                      Staff Created
                    </Chip>
                  ) : null}
                </View>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                  Services: {item.services.map((s) => s.title).join(', ')} (${item.totalAmount})
                </Text>
              </Card.Content>

              <Card.Actions style={styles.cardActions}>
                {item.status === BookingStatus.PENDING && (
                  <Button
                    compact
                    mode="contained-tonal"
                    onPress={() =>
                      statusMutation.mutate({
                        id: item.id,
                        status: BookingStatus.CONFIRMED,
                      })
                    }
                  >
                    Confirm
                  </Button>
                )}

                {item.status === BookingStatus.CONFIRMED && (
                  <Button
                    compact
                    mode="contained"
                    onPress={() =>
                      statusMutation.mutate({
                        id: item.id,
                        status: BookingStatus.COMPLETED,
                      })
                    }
                  >
                    Check-in & Service
                  </Button>
                )}

                <Button
                  compact
                  mode="outlined"
                  icon="cash-register"
                  onPress={() => navigation.navigate('ProcessPayment', { booking: item })}
                >
                  Checkout
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
      />

      <FAB
        icon="plus"
        label="Walk-in Booking"
        style={styles.fab}
        onPress={() => navigation.navigate('StaffBookingForm')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
  },
  searchbar: {
    borderRadius: 12,
  },
  list: {
    padding: 16,
    paddingBottom: 90,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
