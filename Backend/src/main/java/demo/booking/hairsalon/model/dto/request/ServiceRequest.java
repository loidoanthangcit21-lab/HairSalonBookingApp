package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ServiceRequest {
    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @Positive(message = "Duration must be positive")
    private int duration;

    private String thumbnailUrl;
    private String description;
    private boolean isActive = true;
}
