package demo.booking.hairsalon.model.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        String bookingCode,
        UUID customerId,
        String customerName,
        String customerPhone,
        UUID stylistId,
        String stylistName,
        String bookingDate,
        String timeSlot,
        String status,
        String paymentStatus,
        Double totalAmount,
        String notes,
        Boolean createdByStaff,
        String creationType,
        String createdAt,
        List<SalonServiceResponse> services
) {
}
