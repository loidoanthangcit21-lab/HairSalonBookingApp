package demo.booking.hairsalon.model.dto.response;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        BigDecimal totalRevenue,
        long todayBookingsCount,
        long completedBookingsCount,
        long cancelledBookingsCount,
        long activeExpertsCount
) {
}
