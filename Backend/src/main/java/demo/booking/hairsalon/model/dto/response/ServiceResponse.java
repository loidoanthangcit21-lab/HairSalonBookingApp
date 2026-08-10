package demo.booking.hairsalon.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ServiceResponse {
    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private String name;
    private BigDecimal price;
    private int duration;
    private String thumbnailUrl;
    private String description;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
