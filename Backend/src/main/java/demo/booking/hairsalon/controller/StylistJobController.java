package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.model.enums.BookingStatus;
import demo.booking.hairsalon.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stylist")
@PreAuthorize("hasRole('STYLIST')")
public class StylistJobController {

    private final BookingService bookingService;

    @GetMapping("/assigned-jobs")
    public ApiResponse<List<BookingResponse>> getAssignedJobs() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getStylistAssignedJobs(email), "Assigned jobs retrieved successfully", null);
    }

    @PutMapping("/jobs/{id}/status")
    public ApiResponse<Void> updateJobStatus(@PathVariable UUID id, @RequestParam BookingStatus newStatus) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        bookingService.updateBookingStatus(email, id, newStatus);
        return ApiResponse.success(null, "Job status updated successfully", null);
    }
}
