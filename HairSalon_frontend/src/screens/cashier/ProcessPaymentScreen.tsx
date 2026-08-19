import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  List,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService, InvoiceDto } from '../../services/paymentService';
import { Booking } from '../../types/booking';

export const ProcessPaymentScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'QR'>('QR');
  const [secondsLeft, setSecondsLeft] = useState<number>(600);

  const booking: Booking = route?.params?.booking || {};

  const { data: invoice, isLoading, isError, refetch } = useQuery<InvoiceDto>({
    queryKey: ['invoice', booking.id],
    queryFn: () => paymentService.getInvoiceByBookingId(booking.id),
    enabled: !!booking.id,
  });

  useEffect(() => {
    if (invoice?.remainingSeconds !== undefined) {
      setSecondsLeft(invoice.remainingSeconds);
    }
  }, [invoice]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const paymentMutation = useMutation({
    mutationFn: () => {
      if (!invoice) throw new Error('Invoice unavailable');
      return paymentService.processPayment({
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        paymentMethod: paymentMethod,
        transactionCode: `TXN-${Date.now()}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
  });

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalAmount = invoice ? invoice.totalAmount : (booking.totalAmount || 0);
  const isQrExpired = secondsLeft <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Thanh Toán & Hóa Đơn (Admin)" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Customer Header */}
        <Surface style={styles.headerSurface} elevation={1}>
          <Text variant="titleMedium" style={styles.codeText}>
            Mã Đơn Đặt #{booking.bookingCode || 'BK-XXXX'}
          </Text>
          <Text variant="headlineSmall" style={styles.customerName}>
            {invoice?.customerName || booking.customerName || 'Khách Vãng Lai'}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            Thời gian: {invoice?.bookingTime || `${booking.bookingDate} ${booking.timeSlot}`}
          </Text>
        </Surface>

        {/* Payment Method Selector */}
        <Surface style={styles.methodSurface} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Phương Thức Thanh Toán
          </Text>
          <SegmentedButtons
            value={paymentMethod}
            onValueChange={(val) => setPaymentMethod(val as any)}
            buttons={[
              { value: 'QR', label: 'Mã QR VietQR', icon: 'qrcode' },
              { value: 'BANK_TRANSFER', label: 'Chuyển Khoản', icon: 'bank' },
              { value: 'CASH', label: 'Tiền Mặt', icon: 'cash' },
            ]}
            style={{ marginTop: 8 }}
          />
        </Surface>

        {/* Dynamic VietQR Preview for QR / BANK_TRANSFER */}
        {(paymentMethod === 'QR' || paymentMethod === 'BANK_TRANSFER') && (
          <Card mode="outlined" style={styles.qrCard}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Chip icon="clock-outline" style={{ marginBottom: 12, backgroundColor: isQrExpired ? theme.colors.errorContainer : theme.colors.primaryContainer }}>
                {isQrExpired ? '⚠️ Mã QR đã hết hạn thanh toán' : `Hết hạn sau: ${formatTimer(secondsLeft)}`}
              </Chip>

              {isLoading ? (
                <ActivityIndicator style={{ marginVertical: 30 }} size="large" />
              ) : isQrExpired ? (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.error, fontWeight: 'bold', marginBottom: 12 }}>
                    Mã QR này đã quá thời gian chờ (10 phút)
                  </Text>
                  <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()}>
                    Làm Mới Mã QR
                  </Button>
                </View>
              ) : invoice?.qrCodeUrl ? (
                <Image
                  source={{ uri: invoice.qrCodeUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <Text variant="bodyMedium" style={{ color: theme.colors.error, marginVertical: 20 }}>
                  Không thể tải mã QR
                </Text>
              )}

              <Text variant="bodySmall" style={styles.qrNote}>
                Quét mã VietQR trên bằng App Ngân hàng (Agribank, MB, VCB...) hoặc Ví điện tử (MoMo, ZaloPay).
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Itemized Invoice Details */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Chi Tiết Hóa Đơn
            </Text>
            <List.Item
              title={invoice?.serviceName || 'Dịch vụ làm tóc'}
              description={`Chuyên gia thực hiện: ${invoice?.expertName || 'Salon Expert'}`}
              right={() => (
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  {totalAmount.toLocaleString('vi-VN')} VNĐ
                </Text>
              )}
            />
            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.summaryRow}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                Tổng Tiền Phải Thanh Toán:
              </Text>
              <Text
                variant="headlineMedium"
                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              >
                {totalAmount.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Sticky Bottom Action Button (Admin Only) */}
      <Surface elevation={3} style={styles.bottomBar}>
        <Button
          mode="contained"
          icon="check-circle"
          onPress={() => paymentMutation.mutate()}
          loading={paymentMutation.isPending}
          disabled={paymentMutation.isPending || isLoading || (paymentMethod === 'QR' && isQrExpired)}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 8 }}
        >
          Xác Nhận Đã Nhận Tiền ({totalAmount.toLocaleString('vi-VN')} VNĐ)
        </Button>
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Đã xác nhận thanh toán & hoàn tất đơn hàng thành công!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  headerSurface: {
    padding: 16,
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
  methodSurface: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  qrCard: {
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 12,
  },
  qrImage: {
    width: 240,
    height: 240,
    borderRadius: 12,
    marginVertical: 8,
  },
  qrNote: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  submitBtn: {
    borderRadius: 10,
  },
});
