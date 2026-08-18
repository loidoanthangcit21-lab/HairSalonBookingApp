
import { BookingStatus } from '../constants/bookingStatus';
import { Booking, CreateBookingDto } from '../types/booking';
import { ServiceItem, Stylist } from '../types/service';
import { apiClient } from './apiClient';



export const bookingService = {
  async getServices(): Promise<ServiceItem[]> {
    const response = await apiClient.get('/services');
    return response.data;
  },

  async getStylists(): Promise<Stylist[]> {
    const response = await apiClient.get('/stylists');
    return response.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/my-bookings');
    return response.data;
  },

  async getMyTodayBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/my-today-bookings');
    return response.data;
  },

  async getTodayBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/today');
    return response.data;
  },

  async getStaffCreatedBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/staff-created');
    return response.data;
  },

  async getStylistJobs(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/stylist-jobs');
    return response.data;
  },

  async createBooking(dto: CreateBookingDto): Promise<Booking> {
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
    await apiClient.patch(`/bookings/${bookingId}/cancel`);
    return { success: true };
  },

  async rescheduleBooking(bookingId: string, dto: CreateBookingDto): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${bookingId}`, dto);
    return response.data;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    await apiClient.patch(`/bookings/${bookingId}/status`, { status });
    // Assuming the caller only needs it to succeed (React Query invalidates). We cast to satisfy type
    return { id: bookingId, status } as Booking;
  },

  async processPayment(bookingId: string): Promise<{ success: boolean; message: string }> {
    await apiClient.post(`/bookings/${bookingId}/process-payment`);
    return { success: true, message: 'Thanh toán tiền mặt thành công!' };
  },
};
