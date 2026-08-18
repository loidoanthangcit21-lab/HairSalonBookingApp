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
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CASHIER')")
    public ApiResponse<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isCashier = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CASHIER"));
        if (isCashier) {
            return ApiResponse.success(bookingService.cashierCreateBooking(request), "Booking created successfully", null);
        } else {
            String email = auth.getName();
            return ApiResponse.success(bookingService.createBooking(email, request), "Booking created successfully", null);
        }
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<BookingResponse>> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getMyBookings(email), "Bookings retrieved successfully", null);
    }

    @GetMapping("/my-today-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<BookingResponse>> getMyTodayBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getMyTodayBookings(email), "Today's bookings retrieved successfully", null);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CASHIER', 'STYLIST')")
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
    @PreAuthorize("hasRole('CASHIER')")
    public ApiResponse<Void> markBookingAsPaid(@PathVariable UUID id) {
        bookingService.markAsPaid(id);
        return ApiResponse.success(null, "Booking marked as paid successfully", null);
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('CASHIER')")
    public ApiResponse<List<BookingResponse>> getTodayBookings() {
        return ApiResponse.success(bookingService.getTodayBookings(), "Today's bookings retrieved successfully", null);
    }

    @GetMapping("/stylist-jobs")
    @PreAuthorize("hasRole('STYLIST')")
    public ApiResponse<List<BookingResponse>> getStylistAssignedJobs() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getStylistAssignedJobs(email), "Assigned jobs retrieved successfully", null);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('CASHIER')")
    public ApiResponse<Void> updateBookingStatus(@PathVariable UUID id, @RequestBody java.util.Map<String, demo.booking.hairsalon.model.enums.BookingStatus> body) {
        bookingService.updateBookingStatus(id, body.get("status"));
        return ApiResponse.success(null, "Booking status updated successfully", null);
    }

    @GetMapping("/staff-created")
    @PreAuthorize("hasRole('CASHIER')")
    public ApiResponse<List<BookingResponse>> getStaffCreatedBookings() {
        return ApiResponse.success(bookingService.getStaffCreatedBookings(), "Staff created bookings retrieved successfully", null);
    }
}
