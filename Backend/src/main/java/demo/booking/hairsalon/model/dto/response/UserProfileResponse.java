package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String role,
        String phoneNumber,
        String avatarUrl
) {
}
