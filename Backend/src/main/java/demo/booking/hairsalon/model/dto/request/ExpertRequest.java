package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public record ExpertRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        String phone,

        String description,

        @Min(value = 0, message = "Experience years must be non-negative")
        Integer experienceYears,

        String avatarUrl,

        Boolean isActive,

        List<UUID> categoryIds,

        List<String> portfolioImages
) {
}
