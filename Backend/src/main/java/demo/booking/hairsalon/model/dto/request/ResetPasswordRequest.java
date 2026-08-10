package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

        @NotBlank(message = "Token is required")
        String token,

        @Size(min = 8, message = "Password must be at least 8 characters")
        String newPassword

) {
}