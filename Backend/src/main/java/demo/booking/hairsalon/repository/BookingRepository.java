package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(UUID customerId);
    List<Booking> findByStylistIdAndAppointmentDate(UUID stylistId, LocalDate date);
    List<Booking> findByAppointmentDateOrderByStartTimeAsc(LocalDate date);
    List<Booking> findByStylistIdAndStatusIn(UUID stylistId, List<BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.stylist.id = :stylistId " +
           "AND b.appointmentDate = :date " +
           "AND b.status IN :statuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    long countOverlappingBookings(@Param("stylistId") UUID stylistId,
                                  @Param("date") LocalDate date,
                                  @Param("startTime") LocalTime startTime,
                                  @Param("endTime") LocalTime endTime,
                                  @Param("statuses") List<BookingStatus> statuses);
}
