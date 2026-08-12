package demo.booking.hairsalon.model.dto.response;

import java.util.UUID;

public record SalonServiceResponse(
        UUID id,
        String name,
        String description,
        Double price,
        Integer duration,
        String imageUrl
) {
}
