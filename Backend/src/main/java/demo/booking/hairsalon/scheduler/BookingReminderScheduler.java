package demo.booking.hairsalon.scheduler;

import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.repository.BookingRepository;
import demo.booking.hairsalon.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingReminderScheduler {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 15 seconds to check for upcoming appointments starting within 30 minutes.
     * Generates a reminder notification for each customer.
     */
    @Scheduled(fixedRate = 15000)
    @Transactional
    public void sendUpcomingAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderThreshold = now.plusMinutes(30);

        List<Booking> upcomingBookings = bookingRepository.findUpcomingBookingsForReminder(reminderThreshold);

        if (upcomingBookings.isEmpty()) {
            return;
        }

        log.info("Found {} upcoming bookings needing appointment reminders...", upcomingBookings.size());

        for (Booking booking : upcomingBookings) {
            try {
                User customer = booking.getUser();
                if (customer != null) {
                    String timeStr = booking.getStartAt() != null
                            ? booking.getStartAt().format(DateTimeFormatter.ofPattern("hh:mm a", Locale.US))
                            : "soon";
                    String dateStr = booking.getStartAt() != null
                            ? booking.getStartAt().toLocalDate().toString()
                            : "";
                    String serviceName = booking.getService() != null ? booking.getService().getName() : "Haircut";
                    String expertName = booking.getExpert() != null ? booking.getExpert().getFullName() : "your stylist";

                    String title = "Upcoming Appointment Reminder ⏰";
                    String message = "Your appointment for " + serviceName + " with " + expertName + " is scheduled for " + dateStr + " at " + timeStr + ". Please arrive on time!";

                    notificationService.sendNotification(customer, title, message, "BOOKING_CONFIRMED");
                    log.info("Sent appointment reminder notification to user: {}", customer.getEmail());
                }

                booking.setReminderSent(true);
                bookingRepository.save(booking);
            } catch (Exception e) {
                log.error("Failed to send appointment reminder for booking ID {}: {}", booking.getId(), e.getMessage());
            }
        }
    }
}
