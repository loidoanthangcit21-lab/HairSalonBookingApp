import { BookingStatus, normalizeBookingStatus, toBackendBookingStatus } from '../constants/bookingStatus';
import { Booking, CreateBookingDto } from '../types/booking';
import { ServiceItem, Stylist } from '../types/service';
import { apiClient } from './apiClient';

const transformService = (item: any): ServiceItem => ({
  id: String(item.id),
  title: item.title || item.name || '',
  name: item.name || item.title || '',
  description: item.description || '',
  durationMinutes: item.durationMinutes ?? 30,
  price: Number(item.price || 0),
  imageUrl: item.imageUrl || '',
  categoryId: String(item.categoryId || ''),
  categoryName: item.categoryName || '',
});

const transformStylist = (item: any): Stylist => {
  const categoriesList = Array.isArray(item.categories)
    ? item.categories.map((c: any) => ({ id: String(c.id), name: c.name }))
    : [];
  const categoryNames = categoriesList.map((c: any) => c.name).join(' • ');


  return {
    id: String(item.id),
    fullName: item.fullName || '',
    phone: item.phone || '',
    specialty: categoryNames || 'Master Stylist',
    rating: item.rating ?? 5.0,
    experienceYears: item.experienceYears ?? 3,
    avatarUrl: item.avatarUrl || '',
    bio: item.description || '',
    description: item.description || '',
    isActive: item.isActive ?? true,
    portfolioImages: Array.isArray(item.portfolioImages) ? item.portfolioImages : [],
    categories: categoriesList,
  };
};



const transformBooking = (item: any): Booking => ({
  id: String(item.id),
  bookingCode: item.bookingCode || `BK-${String(item.id).substring(0, 4).toUpperCase()}`,
  customerId: item.customerId ? String(item.customerId) : undefined,
  customerName: item.customerName || '',
  customerPhone: item.customerPhone || '',
  stylistId: item.expertId ? String(item.expertId) : item.stylistId ? String(item.stylistId) : '',
  stylistName: item.expertName || item.stylistName || 'Stylist',
  expertId: item.expertId ? String(item.expertId) : item.stylistId ? String(item.stylistId) : '',
  expertName: item.expertName || item.stylistName || 'Stylist',
  services: Array.isArray(item.services) ? item.services.map(transformService) : [],
  bookingDate: item.bookingDate || '',
  timeSlot: item.timeSlot || '',
  status: normalizeBookingStatus(item.status),
  totalAmount: Number(item.totalAmount || 0),
  notes: item.notes || '',
  createdByStaff: Boolean(item.createdByStaff),
  creationType: item.creationType || 'Online',
  createdAt: item.createdAt || new Date().toISOString(),
  paymentStatus: item.paymentStatus || 'UNPAID',
});

const transformBookingRequest = (dto: CreateBookingDto) => ({
  bookingDate: dto.bookingDate,
  timeSlot: dto.timeSlot,
  expertId: dto.expertId || dto.stylistId,
  serviceIds: dto.serviceIds,
  notes: dto.notes,
  customerName: dto.customerName,
  customerPhone: dto.customerPhone,
  createdByStaff: dto.createdByStaff,
  creationType: dto.creationType,
});

export const bookingService = {
  async getCategories(): Promise<{ id: string; name: string }[]> {
    try {

      const response = await apiClient.get('/categories');
      const rawData = Array.isArray(response.data) ? response.data : [];
      return rawData.map((item: any) => ({
        id: String(item.id),
        name: item.name || '',
      }));
    } catch {
      return [];
    }
  },


  async getServices(): Promise<ServiceItem[]> {
    const response = await apiClient.get('/services');
    const rawData = Array.isArray(response.data) ? response.data : [];
    return rawData.map(transformService);
  },


  async getStylists(): Promise<Stylist[]> {
    // Backend endpoint is /experts
    const response = await apiClient.get('/experts');
    const rawData = Array.isArray(response.data) ? response.data : [];
    return rawData.map(transformStylist);
  },

  async getMyBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/my-bookings');
    const rawData = Array.isArray(response.data) ? response.data : [];
    return rawData.map(transformBooking);
  },

  async getOccupiedSlots(): Promise<Booking[]> {
    try {
      const response = await apiClient.get('/bookings/occupied-slots');
      const rawData = Array.isArray(response.data) ? response.data : [];
      return rawData.map(transformBooking);
    } catch {
      return [];
    }
  },


  async getTodayBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/today');
    const rawData = Array.isArray(response.data) ? response.data : [];
    return rawData.map(transformBooking);
  },

  async getStaffCreatedBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/staff-created');
    const rawData = Array.isArray(response.data) ? response.data : [];
    return rawData.map(transformBooking);
  },

  async getStylistJobs(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/stylist-jobs');
    const rawData = Array.isArray(response.data) ? response.data : [];
    return rawData.map(transformBooking);
  },

  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    const payload = transformBookingRequest(dto);
    const response = await apiClient.post('/bookings', payload);
    return transformBooking(response.data);
  },

  async createStaffBooking(dto: CreateBookingDto): Promise<Booking> {
    const payload = transformBookingRequest({
      ...dto,
      createdByStaff: true,
      creationType: dto.creationType || 'Walk-in',
    });
    const response = await apiClient.post('/bookings/cashier', payload);
    return transformBooking(response.data);
  },


  async cancelBooking(bookingId: string): Promise<{ success: boolean }> {
    await apiClient.patch(`/bookings/${bookingId}/cancel`);
    return { success: true };
  },

  async rescheduleBooking(bookingId: string, dto: CreateBookingDto): Promise<Booking> {
    const payload = transformBookingRequest(dto);
    const response = await apiClient.put(`/bookings/${bookingId}`, payload);
    return transformBooking(response.data);
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const backendStatusStr = toBackendBookingStatus(status);
    await apiClient.patch(`/bookings/${bookingId}/status`, { status: backendStatusStr });
    return { id: bookingId, status: normalizeBookingStatus(backendStatusStr) } as Booking;
  },

  async processPayment(bookingId: string): Promise<{ success: boolean; message: string }> {
    await apiClient.post(`/bookings/${bookingId}/process-payment`);
    return { success: true, message: 'Thanh toán tiền mặt thành công!' };
  },
};

