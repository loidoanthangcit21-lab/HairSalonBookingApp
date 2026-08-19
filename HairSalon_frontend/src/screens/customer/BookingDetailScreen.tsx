import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  Icon,
  List,
  Portal,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BookingStatus,
} from '../../constants/bookingStatus';
import { Booking } from '../../types/booking';

export const BookingDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showContactDialog, setShowContactDialog] = useState(false);

  const booking: Booking = route?.params?.booking || {
    id: 'bk_1',
    bookingCode: 'BK-8892',
    customerName: 'Alex Johnson',
    customerPhone: '0901234567',
    stylistName: 'David Miller',
    services: [
      {
        id: 'srv_1',
        title: 'Executive Gentleman Haircut',
        price: 25,
        durationMinutes: 45,
      },
    ],
    bookingDate: '2026-08-10',
    timeSlot: '09:00 AM',
    status: BookingStatus.PENDING,
    totalAmount: 25,
    paymentStatus: 'UNPAID',
  };

  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancelBooking(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setSnackbarMessage('Appointment cancelled successfully.');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
  });

  const statusColor = BOOKING_STATUS_COLORS[booking.status] || '#757575';
  const canModify =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.CONFIRMED;

  const serviceTitle = booking.services.map((s) => s.title).join(', ');
  const totalDuration = booking.services.reduce((acc, s) => acc + (s.durationMinutes || 30), 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Appointment Details" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Service Hero & Stylist Profile Header Card */}
        <Card mode="outlined" style={styles.heroCard}>
          <View style={styles.coverContainer}>
            <Card.Cover
              source={{
                uri:
                  booking.services[0]?.imageUrl ||
                  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
              }}
              style={styles.heroCover}
            />
            <Chip
              compact
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
              textStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </Chip>
          </View>

          <Card.Content style={styles.stylistHeaderRow}>
            <Avatar.Image
              size={64}
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
              }}
            />
            <View style={styles.stylistInfoCol}>
              <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                {serviceTitle}
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7, marginVertical: 2 }}>
                with {booking.stylistName}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Contact Card */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="labelSmall" style={{ opacity: 0.6 }}>Customer Contact Info</Text>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 2 }}>
                  {booking.customerName || 'Alex Johnson'}
                </Text>
              </View>
              <Button
                mode="outlined"
                icon="account-box-outline"
                onPress={() => setShowContactDialog(true)}
                style={{ borderRadius: 20 }}
              >
                Contact Info
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Appointment Details List Card */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content style={{ paddingVertical: 8 }}>
            <List.Item
              title="Date"
              description={booking.bookingDate}
              titleStyle={{ fontSize: 12, opacity: 0.6 }}
              descriptionStyle={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.onSurface }}
              left={() => (
                <View style={styles.iconCircle}>
                  <Icon source="calendar-month-outline" size={20} color={theme.colors.primary} />
                </View>
              )}
            />
            <List.Item
              title="Time"
              description={`${booking.timeSlot} (${totalDuration} mins)`}
              titleStyle={{ fontSize: 12, opacity: 0.6 }}
              descriptionStyle={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.onSurface }}
              left={() => (
                <View style={styles.iconCircle}>
                  <Icon source="clock-outline" size={20} color={theme.colors.primary} />
                </View>
              )}
            />
            <List.Item
              title="Price"
              description={`$${booking.totalAmount}`}
              titleStyle={{ fontSize: 12, opacity: 0.6 }}
              descriptionStyle={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.primary }}
              left={() => (
                <View style={styles.iconCircle}>
                  <Icon source="currency-usd" size={20} color={theme.colors.primary} />
                </View>
              )}
            />
            <List.Item
              title="Payment Method"
              description="Cash on Checkout"
              titleStyle={{ fontSize: 12, opacity: 0.6 }}
              descriptionStyle={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.onSurface }}
              left={() => (
                <View style={styles.iconCircle}>
                  <Icon source="cash" size={20} color={theme.colors.primary} />
                </View>
              )}
            />
          </Card.Content>
        </Card>

        {/* Notes Section Card */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
              Notes
            </Text>
            <Text variant="bodyMedium" style={{ opacity: 0.75, lineHeight: 20 }}>
              Please arrive 10 minutes early for your appointment. Let us know if you need to reschedule.
            </Text>
            {booking.notes ? (
              <Text variant="bodySmall" style={{ marginTop: 8, fontStyle: 'italic', color: theme.colors.primary }}>
                Note: {booking.notes}
              </Text>
            ) : null}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Actions Bar */}
      {canModify && (
        <Surface elevation={3} style={styles.bottomBar}>
          <Button
            mode="contained-tonal"
            icon="calendar-sync"
            style={{ flex: 1, borderRadius: 24 }}
            onPress={() =>
              navigation.navigate('BookAppointment', {
                rescheduleBookingId: booking.id,
                initialServiceIds: booking.services.map((s) => s.id),
                initialStylistId: booking.stylistId,
                initialDate: booking.bookingDate,
                initialTimeSlot: booking.timeSlot,
                initialNotes: booking.notes,
              })
            }
          >
            Reschedule
          </Button>
          <Button
            mode="contained"
            buttonColor={theme.colors.error}
            icon="trash-can-outline"
            style={{ flex: 1, borderRadius: 24 }}
            loading={cancelMutation.isPending}
            disabled={cancelMutation.isPending}
            onPress={() => cancelMutation.mutate()}
          >
            Cancel Appointment
          </Button>
        </Surface>
      )}

      <Portal>
        <Dialog
          visible={showContactDialog}
          onDismiss={() => setShowContactDialog(false)}
          style={{ borderRadius: 20 }}
        >
          <Dialog.Title style={{ fontWeight: 'bold' }}>Contact Information</Dialog.Title>
          <Dialog.Content>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon source="account" size={20} color={theme.colors.primary} />
                <View>
                  <Text variant="labelSmall" style={{ opacity: 0.6 }}>Customer Name</Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {booking.customerName || 'Alex Johnson'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon source="phone" size={20} color={theme.colors.primary} />
                <View>
                  <Text variant="labelSmall" style={{ opacity: 0.6 }}>Phone Number</Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    {booking.customerPhone || '0901234567'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon source="store" size={20} color={theme.colors.primary} />
                <View>
                  <Text variant="labelSmall" style={{ opacity: 0.6 }}>Salon Support Hotline</Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    0901234567
                  </Text>
                </View>
              </View>

              <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4, fontStyle: 'italic' }}>
                Note: Use this contact information to communicate cancellation requests, time adjustments, or late arrival notifications.
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={() => setShowContactDialog(false)}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage('')}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  heroCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  coverContainer: {
    position: 'relative',
  },
  heroCover: {
    height: 180,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
  },
  stylistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stylistInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EDF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
