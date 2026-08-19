package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.PaymentRequest;
import demo.booking.hairsalon.model.dto.response.InvoiceResponse;
import demo.booking.hairsalon.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/invoices/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ApiResponse<InvoiceResponse> getInvoiceByBookingId(@PathVariable UUID bookingId) {
        return ApiResponse.success(paymentService.getInvoiceByBookingId(bookingId), "Invoice retrieved successfully", null);
    }

    @PostMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> processPayment(@Valid @RequestBody PaymentRequest request) {
        paymentService.processPayment(request);
        return ApiResponse.success(null, "Payment processed successfully", null);
    }
}
