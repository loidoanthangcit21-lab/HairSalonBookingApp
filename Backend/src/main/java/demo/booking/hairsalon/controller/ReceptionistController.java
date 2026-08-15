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
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/receptionist")
@PreAuthorize("hasRole('RECEPTIONIST')")
public class ReceptionistController {

    private final BookingService bookingService;

    @GetMapping("/today-bookings")
    public ApiResponse<List<BookingResponse>> getTodayBookings() {
        return ApiResponse.success(bookingService.getTodayBookings(), "Today's bookings retrieved successfully", null);
    }

    @PostMapping("/bookings")
    public ApiResponse<BookingResponse> createBookingForCustomer(@Valid @RequestBody BookingRequest request) {
        return ApiResponse.success(bookingService.receptionistCreateBooking(request), "Booking created successfully", null);
    }
}
