import { apiClient } from './apiClient';

export interface InvoiceDto {
  id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  expertName: string;
  bookingTime: string;
  totalAmount: number;
  qrCodeUrl: string;
  createdAt: string;
  expiresAt: string;
  remainingSeconds: number;
  isExpired: boolean;
}

export interface ProcessPaymentPayload {
  invoiceId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'QR';
  transactionCode?: string;
}

export const paymentService = {
  async getInvoiceByBookingId(bookingId: string): Promise<InvoiceDto> {
    const response = await apiClient.get(`/invoices/booking/${bookingId}`);
    return response.data;
  },

  async processPayment(payload: ProcessPaymentPayload): Promise<{ success: boolean }> {
    await apiClient.post('/payments', payload);
    return { success: true };
  },
};
