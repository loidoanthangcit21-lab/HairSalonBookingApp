package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record StylistResponse(
        UUID id,
        String fullName,
        String specialty,
        Double rating,
        Integer experienceYears,
        String avatarUrl,
        String bio,
        java.util.List<String> portfolioImages
) {
}
