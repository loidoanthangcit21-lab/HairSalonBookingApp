package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangeRoleRequest(
        @NotBlank(message = "Role is required")
        @Pattern(regexp = "^(CUSTOMER|RECEPTIONIST|STYLIST|ADMIN)$", message = "Invalid role")
        String role
) {
}
