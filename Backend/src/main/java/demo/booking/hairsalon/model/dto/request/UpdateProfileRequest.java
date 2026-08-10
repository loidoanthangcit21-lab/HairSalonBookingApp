package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateProfileRequest(

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Invalid phone number format")
        String phone

) {
}
