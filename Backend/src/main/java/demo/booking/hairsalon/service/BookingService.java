package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.BookingRequest;
import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.model.enums.BookingStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingService {
    // Customer
    BookingResponse createBooking(String customerEmail, BookingRequest request);
    List<BookingResponse> getMyBookings(String customerEmail);
    BookingResponse getBookingById(UUID id);
    BookingResponse updateBooking(String customerEmail, UUID bookingId, BookingRequest request);
    void cancelBooking(String customerEmail, UUID bookingId);

    // Receptionist
    List<BookingResponse> getTodayBookings();
    List<BookingResponse> getStaffCreatedBookings();
    BookingResponse cashierCreateBooking(BookingRequest request);
    void markAsPaid(UUID bookingId);

    // Stylist (Or Receptionist)
    List<BookingResponse> getStylistAssignedJobs(String stylistEmail);
    void updateBookingStatus(UUID bookingId, BookingStatus newStatus);
    List<BookingResponse> getAllActiveBookings();
}

