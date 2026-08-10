package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String imageUrl;
    private String description;
    private boolean isActive = true;
}
