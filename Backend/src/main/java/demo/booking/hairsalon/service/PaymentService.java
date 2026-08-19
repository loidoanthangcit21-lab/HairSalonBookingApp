package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.PaymentRequest;
import demo.booking.hairsalon.model.dto.response.InvoiceResponse;

import java.util.UUID;

public interface PaymentService {
    InvoiceResponse getInvoiceByBookingId(UUID bookingId);
    void processPayment(PaymentRequest request);
}
