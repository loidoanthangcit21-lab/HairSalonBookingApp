import { BookingStatus } from '../constants/bookingStatus';
import { ServiceItem } from './service';

export interface Booking {
  id: string;
  bookingCode: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  stylistId: string;
  stylistName: string;
  services: ServiceItem[];
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  createdByStaff?: boolean;
  creationType?: 'Walk-in' | 'Phone Call' | 'Online';
  createdAt: string;
  paymentStatus?: 'UNPAID' | 'PAID_CASH';
}

export interface CreateBookingDto {
  serviceIds: string[];
  stylistId: string;
  bookingDate: string;
  timeSlot: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  createdByStaff?: boolean;
  creationType?: 'Walk-in' | 'Phone Call';
}
