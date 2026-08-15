import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  List,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';

export const ProcessPaymentScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

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
    bookingDate: '2026-08-09',
    timeSlot: '09:00 AM',
    status: 'completed',
    totalAmount: 25,
    paymentStatus: 'UNPAID',
  };

  const subtotal = booking.totalAmount;
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  const paymentMutation = useMutation({
    mutationFn: () => bookingService.processPayment(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Cash Checkout & Bill" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Customer Header */}
        <Surface style={styles.headerSurface} elevation={1}>
          <Text variant="titleMedium" style={styles.codeText}>
            Booking Reference #{booking.bookingCode}
          </Text>
          <Text variant="headlineSmall" style={styles.customerName}>
            {booking.customerName}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            Phone: {booking.customerPhone} • Stylist: {booking.stylistName}
          </Text>
        </Surface>

        {/* Itemized Receipt Breakdown */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Receipt Breakdown
            </Text>
            {booking.services.map((srv, idx) => (
              <List.Item
                key={idx}
                title={srv.title}
                description="Standard Service Rate"
                right={() => (
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    ${srv.price}
                  </Text>
                )}
              />
            ))}
            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Subtotal:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                ${subtotal}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Tax & Service Fee (10%):</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                ${tax}
              </Text>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.summaryRow}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                Total Cash Amount Due:
              </Text>
              <Text
                variant="headlineMedium"
                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              >
                ${grandTotal}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Cash Payment Indicator */}
        <Surface style={styles.paymentMethodCard} elevation={1}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Chip icon="cash" style={{ backgroundColor: theme.colors.primaryContainer }}>
              Cash Checkout Only
            </Chip>
          </View>
          <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.8 }}>
            Customer will pay ${grandTotal} in cash directly to the receptionist at the front counter.
          </Text>
        </Surface>
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <Surface elevation={2} style={styles.bottomBar}>
        <Button
          mode="contained"
          icon="cash-check"
          onPress={() => paymentMutation.mutate()}
          loading={paymentMutation.isPending}
          disabled={paymentMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Complete & Process Cash Bill (${grandTotal})
        </Button>
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Cash payment processed & bill completed!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  headerSurface: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  codeText: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  customerName: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  paymentMethodCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  submitBtn: {
    borderRadius: 8,
  },
});
