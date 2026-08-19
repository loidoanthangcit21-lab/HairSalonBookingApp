package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Full name is required")
        String fullName,

        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String email,

        String phone,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100)
        String password

) {

}
