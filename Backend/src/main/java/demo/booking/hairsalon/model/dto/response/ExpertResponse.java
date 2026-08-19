package demo.booking.hairsalon.model.dto.response;

import java.util.List;
import java.util.UUID;

public record ExpertResponse(
        UUID id,
        String fullName,
        String phone,
        String description,
        Integer experienceYears,
        String avatarUrl,
        boolean isActive,
        List<String> portfolioImages,
        List<CategoryResponse> categories
) {
}

