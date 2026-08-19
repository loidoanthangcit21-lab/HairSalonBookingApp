package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.model.dto.response.DashboardSummaryResponse;
import demo.booking.hairsalon.model.entity.Payment;
import demo.booking.hairsalon.model.enums.BookingStatus;
import demo.booking.hairsalon.model.enums.PaymentStatus;
import demo.booking.hairsalon.repository.BookingRepository;
import demo.booking.hairsalon.repository.ExpertRepository;
import demo.booking.hairsalon.repository.PaymentRepository;
import demo.booking.hairsalon.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final ExpertRepository expertRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        // Calculate total revenue from successful payments
        BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS && p.getAmount() != null)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count today's bookings
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        long todayBookingsCount = bookingRepository.findAll().stream()
                .filter(b -> b.getStartAt() != null && !b.getStartAt().isBefore(startOfDay) && !b.getStartAt().isAfter(endOfDay))
                .count();

        long completedBookingsCount = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        long cancelledBookingsCount = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        long activeExpertsCount = expertRepository.findByIsActiveTrue().size();

        return new DashboardSummaryResponse(
                totalRevenue,
                todayBookingsCount,
                completedBookingsCount,
                cancelledBookingsCount,
                activeExpertsCount
        );
    }
}
