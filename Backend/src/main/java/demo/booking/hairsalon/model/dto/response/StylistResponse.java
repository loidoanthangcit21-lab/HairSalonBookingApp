package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record StylistResponse(
        UUID id,
        UUID userId,
        String firstName,
        String lastName,
        String avatarUrl,
        String bio,
        Integer experienceYears,
        Double rating
) {
}
