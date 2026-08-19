export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECK_IN = 'check_in',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  NO_SHOW = 'no_show',
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.CONFIRMED]: 'Confirmed',
  [BookingStatus.CHECK_IN]: 'Checked In',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.CANCELED]: 'Canceled',
  [BookingStatus.NO_SHOW]: 'No Show',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: '#FF9800',
  [BookingStatus.CONFIRMED]: '#2196F3',
  [BookingStatus.CHECK_IN]: '#00BCD4',
  [BookingStatus.COMPLETED]: '#4CAF50',
  [BookingStatus.CANCELED]: '#F44336',
  [BookingStatus.NO_SHOW]: '#E65100',
};

export const normalizeBookingStatus = (statusStr: string): BookingStatus => {
  if (!statusStr) return BookingStatus.PENDING;
  const upper = statusStr.toUpperCase();
  switch (upper) {
    case 'PENDING':
      return BookingStatus.PENDING;
    case 'CONFIRMED':
      return BookingStatus.CONFIRMED;
    case 'CHECK_IN':
    case 'CHECKIN':
      return BookingStatus.CHECK_IN;
    case 'COMPLETED':
      return BookingStatus.COMPLETED;
    case 'CANCELLED':
    case 'CANCELED':
      return BookingStatus.CANCELED;
    case 'NO_SHOW':
    case 'NOSHOW':
      return BookingStatus.NO_SHOW;
    default:
      return BookingStatus.PENDING;
  }
};

export const toBackendBookingStatus = (status: BookingStatus | string): string => {
  const normalized = typeof status === 'string' ? normalizeBookingStatus(status) : status;
  switch (normalized) {
    case BookingStatus.PENDING:
      return 'PENDING';
    case BookingStatus.CONFIRMED:
      return 'CONFIRMED';
    case BookingStatus.CHECK_IN:
      return 'CHECK_IN';
    case BookingStatus.COMPLETED:
      return 'COMPLETED';
    case BookingStatus.CANCELED:
      return 'CANCELLED';
    case BookingStatus.NO_SHOW:
      return 'NO_SHOW';
    default:
      return 'PENDING';
  }
};

