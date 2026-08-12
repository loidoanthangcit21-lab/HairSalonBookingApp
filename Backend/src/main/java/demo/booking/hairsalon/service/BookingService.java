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
    void cancelBooking(String customerEmail, UUID bookingId);

    // Receptionist
    List<BookingResponse> getTodayBookings();
    BookingResponse receptionistCreateBooking(BookingRequest request, UUID customerId);
    void markAsPaid(UUID bookingId);

    // Stylist
    List<BookingResponse> getStylistAssignedJobs(String stylistEmail);
    void updateBookingStatus(String stylistEmail, UUID bookingId, BookingStatus newStatus);
}
