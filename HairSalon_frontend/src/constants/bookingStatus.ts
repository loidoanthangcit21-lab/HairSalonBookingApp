export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.CONFIRMED]: 'Confirmed',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.CANCELED]: 'Canceled',
  [BookingStatus.NO_SHOW]: 'No Show',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: '#FF9800',
  [BookingStatus.CONFIRMED]: '#2196F3',
  [BookingStatus.COMPLETED]: '#4CAF50',
  [BookingStatus.CANCELED]: '#F44336',
  [BookingStatus.NO_SHOW]: '#E65100',
};
