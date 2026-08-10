package demo.booking.hairsalon.model.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String role,
        String authProvider,
        boolean emailVerified,
        boolean isActive,
        LocalDateTime createdAt
) {}
