package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.BookingRequest;
import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.createBooking(email, request), "Booking created successfully", null);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<BookingResponse>> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getMyBookings(email), "Bookings retrieved successfully", null);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'STYLIST')")
    public ApiResponse<BookingResponse> getBookingById(@PathVariable UUID id) {
        return ApiResponse.success(bookingService.getBookingById(id), "Booking retrieved successfully", null);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<Void> cancelBooking(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        bookingService.cancelBooking(email, id);
        return ApiResponse.success(null, "Booking cancelled successfully", null);
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<Void> markBookingAsPaid(@PathVariable UUID id) {
        bookingService.markAsPaid(id);
        return ApiResponse.success(null, "Booking marked as paid successfully", null);
    }
}
