package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.request.PaymentRequest;
import demo.booking.hairsalon.model.dto.response.InvoiceResponse;
import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.entity.Invoice;
import demo.booking.hairsalon.model.entity.Payment;
import demo.booking.hairsalon.model.enums.BookingStatus;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.model.enums.PaymentStatus;
import demo.booking.hairsalon.repository.BookingRepository;
import demo.booking.hairsalon.repository.InvoiceRepository;
import demo.booking.hairsalon.repository.PaymentRepository;
import demo.booking.hairsalon.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Value("${app.payment.bank-id:VBA}")
    private String bankId;

    @Value("${app.payment.account-no:0901234567}")
    private String accountNo;

    @Value("${app.payment.account-name:HAIR SALON}")
    private String accountName;

    @Value("${app.payment.qr-expiration-minutes:10}")
    private int qrExpirationMinutes;

    @Override
    @Transactional
    public InvoiceResponse getInvoiceByBookingId(UUID bookingId) {
        Invoice invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseGet(() -> createInvoiceForBooking(bookingId));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = invoice.getCreatedAt() != null ? invoice.getCreatedAt() : now;
        LocalDateTime expiresAt = createdAt.plusMinutes(qrExpirationMinutes);

        // If invoice is expired, reset createdAt to refresh QR timestamp
        if (now.isAfter(expiresAt)) {
            invoice.setCreatedAt(now);
            invoice = invoiceRepository.save(invoice);
            createdAt = now;
            expiresAt = createdAt.plusMinutes(qrExpirationMinutes);
        }

        long remainingSeconds = Math.max(0, Duration.between(now, expiresAt).getSeconds());
        boolean isExpired = remainingSeconds <= 0;

        Booking booking = invoice.getBooking();
        String customerName = booking.getUser() != null ? booking.getUser().getFullName() : "Walk-in Customer";
        String serviceName = booking.getService() != null ? booking.getService().getName() : "N/A";
        String expertName = booking.getExpert() != null ? booking.getExpert().getFullName() : "Unassigned";

        String startStr = booking.getStartAt() != null ? booking.getStartAt().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")) : "";
        String endStr = booking.getEndAt() != null ? booking.getEndAt().format(DateTimeFormatter.ofPattern("HH:mm")) : "";
        String bookingTime = startStr + " - " + endStr;

        // Dynamic QR code generation based on configurable bank account, amount, and booking ID
        String bookingCode = booking.getId().toString().substring(0, 8).toUpperCase();
        String qrCodeUrl = "https://img.vietqr.io/image/" + bankId + "-" + accountNo + "-compact2.png?amount="
                + invoice.getTotalAmount().longValue()
                + "&addInfo=SALON%20" + bookingCode;

        return new InvoiceResponse(
                invoice.getId(),
                booking.getId(),
                customerName,
                serviceName,
                expertName,
                bookingTime,
                invoice.getTotalAmount(),
                qrCodeUrl,
                createdAt.toString(),
                expiresAt.toString(),
                remainingSeconds,
                isExpired
        );
    }

    @Override
    @Transactional
    public void processPayment(PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.invoiceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = invoice.getCreatedAt() != null ? invoice.getCreatedAt() : now;
        LocalDateTime expiresAt = createdAt.plusMinutes(qrExpirationMinutes);

        if (request.paymentMethod() == demo.booking.hairsalon.model.enums.PaymentMethod.QR && now.isAfter(expiresAt)) {
            throw new BusinessException(ErrorCode.QR_CODE_EXPIRED);
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(request.amount())
                .paymentMethod(request.paymentMethod())
                .status(PaymentStatus.SUCCESS)
                .transactionCode(request.transactionCode() != null ? request.transactionCode() : "TXN-" + System.currentTimeMillis())
                .paidAt(now)
                .build();

        paymentRepository.save(payment);

        Booking booking = invoice.getBooking();
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(now);
        bookingRepository.save(booking);
    }

    private Invoice createInvoiceForBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));

        Invoice invoice = Invoice.builder()
                .booking(booking)
                .totalAmount(booking.getService() != null ? booking.getService().getPrice() : java.math.BigDecimal.ZERO)
                .build();

        return invoiceRepository.save(invoice);
    }
}
