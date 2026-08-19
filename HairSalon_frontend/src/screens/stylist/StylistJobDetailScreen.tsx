import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  List,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';
import { BookingStatus } from '../../constants/bookingStatus';

export const StylistJobDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const job: Booking = route?.params?.job || {
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
    bookingDate: '2026-08-09',
    timeSlot: '09:00 AM',
    status: BookingStatus.PENDING,
    totalAmount: 25,
    notes: 'Please cut shorter on the sides. Wants a clean low fade look.',
  };

  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(job.status);

  const statusMutation = useMutation({
    mutationFn: (newStatus: BookingStatus) =>
      bookingService.updateBookingStatus(job.id, newStatus),
    onSuccess: (_, newStatus) => {
      setCurrentStatus(newStatus);
      queryClient.invalidateQueries({ queryKey: ['stylistJobs'] });
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });

      if (newStatus === BookingStatus.CONFIRMED) {
        setSnackbarMessage('Service status updated to: IN SERVICE');
      } else if (newStatus === BookingStatus.COMPLETED) {
        setSnackbarMessage('Service completed successfully!');
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Job Progress — ${job.customerName}`} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.headerSurface} elevation={1}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            Customer: {job.customerName}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.8, marginTop: 4 }}>
            📅 Appointment: {job.bookingDate} at {job.timeSlot}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.8, marginTop: 2 }}>
            📞 Phone: {job.customerPhone}
          </Text>
          <Chip
            icon={currentStatus === BookingStatus.CONFIRMED ? 'content-cut' : 'clock-outline'}
            style={{
              marginTop: 12,
              backgroundColor:
                currentStatus === BookingStatus.CONFIRMED
                  ? '#E3F2FD'
                  : currentStatus === BookingStatus.COMPLETED
                  ? '#E8F5E9'
                  : theme.colors.surfaceVariant,
            }}
          >
            Current Status:{' '}
            {currentStatus === BookingStatus.CONFIRMED
              ? 'IN PROGRESS'
              : currentStatus.toUpperCase()}
          </Chip>
        </Surface>

        {/* Customer Request Notes Box */}
        <Surface style={styles.notesBox} elevation={2}>
          <Text variant="titleMedium" style={styles.notesHeader}>
            ✂️ Customer Request & Styling Instructions
          </Text>
          <Text variant="bodyLarge" style={styles.notesText}>
            {job.notes || 'No special requests provided. Standard service procedures.'}
          </Text>
        </Surface>

        {/* Services List */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Required Haircut & Styling Services
            </Text>
            {job.services.map((srv, idx) => (
              <List.Item
                key={idx}
                title={srv.title}
                description={`Duration: ${srv.durationMinutes || 30} mins`}
                left={(p) => <List.Icon {...p} icon="content-cut" />}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Action Button Stack */}
        <View style={styles.btnStack}>
          <Button
            mode="contained"
            icon="play-circle"
            loading={statusMutation.isPending}
            disabled={
              statusMutation.isPending ||
              currentStatus === BookingStatus.CONFIRMED ||
              currentStatus === BookingStatus.COMPLETED
            }
            onPress={() => statusMutation.mutate(BookingStatus.CONFIRMED)}
            style={styles.actionBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            {currentStatus === BookingStatus.CONFIRMED
              ? 'Service In Progress ✂️'
              : 'Start Service (In Progress)'}
          </Button>

          <Button
            mode="contained"
            buttonColor={theme.colors.primary}
            icon="check-circle"
            loading={statusMutation.isPending}
            disabled={statusMutation.isPending}
            onPress={() => statusMutation.mutate(BookingStatus.COMPLETED)}
            style={styles.actionBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            Complete Service (Finish Haircut)
          </Button>
        </View>
      </ScrollView>

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
  },
  headerSurface: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  notesBox: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FAF5FF',
    marginBottom: 16,
  },
  notesHeader: {
    fontWeight: 'bold',
    color: '#6750A4',
    marginBottom: 8,
  },
  notesText: {
    lineHeight: 22,
    color: '#333',
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
  },
  btnStack: {
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    borderRadius: 8,
  },
});
