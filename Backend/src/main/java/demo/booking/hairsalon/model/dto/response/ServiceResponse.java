package demo.booking.hairsalon.model.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ServiceResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        UUID categoryId,
        String categoryName
) {
}
