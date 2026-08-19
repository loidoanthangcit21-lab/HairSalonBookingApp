package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String description,
        boolean isActive
) {
}
