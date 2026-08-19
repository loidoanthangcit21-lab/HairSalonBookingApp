package demo.booking.hairsalon.model.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        UUID bookingId,
        String customerName,
        String serviceName,
        String expertName,
        String bookingTime,
        BigDecimal totalAmount,
        String qrCodeUrl,
        String createdAt,
        String expiresAt,
        Long remainingSeconds,
        Boolean isExpired
) {
}
