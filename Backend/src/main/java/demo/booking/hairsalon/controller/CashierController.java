package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.BookingRequest;
import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cashier")
@PreAuthorize("hasRole('CASHIER')")
public class CashierController {

    private final BookingService bookingService;

    @GetMapping("/today-bookings")
    public ApiResponse<List<BookingResponse>> getTodayBookings() {
        return ApiResponse.success(bookingService.getTodayBookings(), "Today's bookings retrieved successfully", null);
    }

    @PostMapping("/bookings")
    public ApiResponse<BookingResponse> createBookingForCustomer(@Valid @RequestBody BookingRequest request) {
        return ApiResponse.success(bookingService.cashierCreateBooking(request), "Booking created successfully", null);
    }
}
