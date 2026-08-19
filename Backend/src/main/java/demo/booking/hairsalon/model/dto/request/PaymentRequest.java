package demo.booking.hairsalon.model.dto.request;

import demo.booking.hairsalon.model.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record PaymentRequest(
        @NotNull(message = "Invoice ID is required")
        UUID invoiceId,

        @NotNull(message = "Amount is required")
        BigDecimal amount,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        String transactionCode
) {
}
