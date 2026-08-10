package demo.booking.hairsalon.model.dto.request;

import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(
        @NotNull(message = "Status (isActive) is required")
        Boolean isActive
) {
}
