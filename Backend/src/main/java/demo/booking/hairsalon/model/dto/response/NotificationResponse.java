package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String title,
        String message,
        String timestamp,
        boolean read,
        String type
) {
}
