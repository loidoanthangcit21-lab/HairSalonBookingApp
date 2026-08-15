package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record SalonServiceResponse(
        UUID id,
        String title,
        String description,
        Double price,
        Integer durationMinutes,
        String imageUrl,
        UUID categoryId,
        String categoryName
) {
}
