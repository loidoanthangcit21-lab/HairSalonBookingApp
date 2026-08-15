import { ENV } from '../config/env';
import { BookingStatus } from '../constants/bookingStatus';
import { MOCK_BOOKINGS } from '../mocks/mockBookings';
import { MOCK_SERVICES, MOCK_STYLISTS } from '../mocks/mockServices';
import { Booking, CreateBookingDto } from '../types/booking';
import { ServiceItem, Stylist } from '../types/service';
import { apiClient } from './apiClient';

const delay = (ms: number) => new Promise((res) => setTimeout(() => res(true), ms));

let localBookingsList: Booking[] = [...MOCK_BOOKINGS];

export const bookingService = {
  async getServices(): Promise<ServiceItem[]> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return MOCK_SERVICES;
    }
    const response = await apiClient.get('/services');
    return response.data;
  },

  async getStylists(): Promise<Stylist[]> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return MOCK_STYLISTS;
    }
    const response = await apiClient.get('/stylists');
    return response.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return localBookingsList;
    }
    const response = await apiClient.get('/bookings/my-bookings');
    return response.data;
  },

  async getTodayBookings(): Promise<Booking[]> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return localBookingsList;
    }
    const response = await apiClient.get('/bookings/today');
    return response.data;
  },

  async getStaffCreatedBookings(): Promise<Booking[]> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return localBookingsList.filter((b) => b.createdByStaff);
    }
    const response = await apiClient.get('/bookings/staff-created');
    return response.data;
  },

  async getStylistJobs(): Promise<Booking[]> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return localBookingsList;
    }
    const response = await apiClient.get('/bookings/stylist-jobs');
    return response.data;
  },

  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      const selectedServices = MOCK_SERVICES.filter((s) => dto.serviceIds.includes(s.id));
      const stylist = MOCK_STYLISTS.find((st) => st.id === dto.stylistId) || MOCK_STYLISTS[0];
      const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

      const newBooking: Booking = {
        id: `bk_${Date.now()}`,
        bookingCode: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: dto.customerName || 'Alex Johnson',
        customerPhone: dto.customerPhone || '0901234567',
        stylistId: stylist.id,
        stylistName: stylist.fullName,
        services: selectedServices.length > 0 ? selectedServices : [MOCK_SERVICES[0]],
        bookingDate: dto.bookingDate,
        timeSlot: dto.timeSlot,
        status: BookingStatus.PENDING,
        totalAmount,
        notes: dto.notes,
        createdByStaff: dto.createdByStaff,
        creationType: dto.creationType || 'Online',
        createdAt: new Date().toISOString(),
        paymentStatus: 'UNPAID',
      };

      localBookingsList.unshift(newBooking);
      return newBooking;
    }
    const response = await apiClient.post('/bookings', dto);
    return response.data;
  },

  async createStaffBooking(dto: CreateBookingDto): Promise<Booking> {
    return this.createBooking({
      ...dto,
      createdByStaff: true,
      creationType: dto.creationType || 'Walk-in',
    });
  },

  async cancelBooking(bookingId: string): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      localBookingsList = localBookingsList.map((b) =>
        b.id === bookingId ? { ...b, status: BookingStatus.CANCELED } : b
      );
      return { success: true };
    }
    const response = await apiClient.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  async rescheduleBooking(bookingId: string, dto: CreateBookingDto): Promise<Booking> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      const selectedServices = MOCK_SERVICES.filter((s) => dto.serviceIds.includes(s.id));
      const stylist = MOCK_STYLISTS.find((st) => st.id === dto.stylistId) || MOCK_STYLISTS[0];
      const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

      localBookingsList = localBookingsList.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            stylistId: stylist.id,
            stylistName: stylist.fullName,
            services: selectedServices.length > 0 ? selectedServices : b.services,
            bookingDate: dto.bookingDate,
            timeSlot: dto.timeSlot,
            notes: dto.notes !== undefined ? dto.notes : b.notes,
            totalAmount: totalAmount > 0 ? totalAmount : b.totalAmount,
            status: BookingStatus.PENDING,
          };
        }
        return b;
      });
      const updated = localBookingsList.find((b) => b.id === bookingId);
      return updated!;
    }
    const response = await apiClient.put(`/bookings/${bookingId}`, dto);
    return response.data;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      localBookingsList = localBookingsList.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      );
      const updated = localBookingsList.find((b) => b.id === bookingId)!;
      return updated;
    }
    const response = await apiClient.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  async processPayment(bookingId: string): Promise<{ success: boolean; message: string }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      localBookingsList = localBookingsList.map((b) =>
        b.id === bookingId ? { ...b, paymentStatus: 'PAID_CASH', status: BookingStatus.COMPLETED } : b
      );
      return { success: true, message: 'Thanh toán tiền mặt thành công!' };
    }
    const response = await apiClient.post(`/bookings/${bookingId}/process-payment`);
    return response.data;
  },
};
