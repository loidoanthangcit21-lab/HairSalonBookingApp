package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String address,
        String role,
        String avatarUrl,
        String specialty,
        Integer experienceYears,
        String bio,
        Double rating,
        java.util.List<String> portfolioImages
) {
}
