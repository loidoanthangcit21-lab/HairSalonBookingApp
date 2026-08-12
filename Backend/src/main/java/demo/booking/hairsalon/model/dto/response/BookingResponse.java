package demo.booking.hairsalon.model.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID customerId,
        String customerName,
        UUID stylistId,
        String stylistName,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime,
        String status,
        String paymentStatus,
        Double totalAmount,
        String notes,
        List<SalonServiceResponse> services
) {
}
