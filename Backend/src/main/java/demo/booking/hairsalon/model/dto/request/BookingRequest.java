package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public record BookingRequest(
        @NotBlank(message = "Booking date is required")
        String bookingDate,

        @NotBlank(message = "Time slot is required")
        String timeSlot,

        UUID expertId,

        @NotEmpty(message = "At least one service must be selected")
        List<UUID> serviceIds,

        String notes,

        String customerName,

        String customerPhone,

        Boolean createdByStaff,

        String creationType
) {
    public UUID stylistId() {
        return expertId;
    }
}
