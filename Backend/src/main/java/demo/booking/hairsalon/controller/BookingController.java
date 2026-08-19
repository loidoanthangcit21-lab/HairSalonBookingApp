package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.BookingRequest;
import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ApiResponse<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.createBooking(email, request), "Booking created successfully", null);
    }

    @PostMapping("/cashier")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BookingResponse> createCashierBooking(@Valid @RequestBody BookingRequest request) {
        return ApiResponse.success(bookingService.cashierCreateBooking(request), "Walk-in booking created successfully", null);
    }


    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<BookingResponse>> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getMyBookings(email), "Bookings retrieved successfully", null);
    }

    @GetMapping("/occupied-slots")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ApiResponse<List<BookingResponse>> getOccupiedSlots() {
        return ApiResponse.success(bookingService.getAllActiveBookings(), "Occupied slots retrieved successfully", null);
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ApiResponse<BookingResponse> getBookingById(@PathVariable UUID id) {
        return ApiResponse.success(bookingService.getBookingById(id), "Booking retrieved successfully", null);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<BookingResponse> updateBooking(@PathVariable UUID id, @Valid @RequestBody BookingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.updateBooking(email, id, request), "Booking updated successfully", null);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<Void> cancelBooking(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        bookingService.cancelBooking(email, id);
        return ApiResponse.success(null, "Booking cancelled successfully", null);
    }

    @PostMapping("/{id}/process-payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> markBookingAsPaid(@PathVariable UUID id) {
        bookingService.markAsPaid(id);
        return ApiResponse.success(null, "Booking marked as paid successfully", null);
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BookingResponse>> getTodayBookings() {
        return ApiResponse.success(bookingService.getTodayBookings(), "Today's bookings retrieved successfully", null);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> updateBookingStatus(@PathVariable UUID id, @RequestBody java.util.Map<String, demo.booking.hairsalon.model.enums.BookingStatus> body) {
        bookingService.updateBookingStatus(id, body.get("status"));
        return ApiResponse.success(null, "Booking status updated successfully", null);
    }

    @GetMapping("/staff-created")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BookingResponse>> getStaffCreatedBookings() {
        return ApiResponse.success(bookingService.getStaffCreatedBookings(), "Staff created bookings retrieved successfully", null);
    }
}
