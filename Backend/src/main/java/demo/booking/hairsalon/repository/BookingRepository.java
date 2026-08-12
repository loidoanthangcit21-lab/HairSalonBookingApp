package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(UUID customerId);
    List<Booking> findByStylistIdAndAppointmentDate(UUID stylistId, LocalDate date);
    List<Booking> findByAppointmentDateOrderByStartTimeAsc(LocalDate date);
    List<Booking> findByStylistIdAndStatusIn(UUID stylistId, List<BookingStatus> statuses);
}
