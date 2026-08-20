package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByUserId(UUID userId);
    List<Booking> findByExpertId(UUID expertId);
    List<Booking> findByServicesId(UUID serviceId);

    @Query("SELECT b FROM Booking b WHERE LOWER(b.expert.fullName) = LOWER(:fullName) OR b.expert.phone = :phone")
    List<Booking> findByExpertNameOrPhone(@Param("fullName") String fullName, @Param("phone") String phone);
    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.expert.id = :expertId " +
           "AND b.status NOT IN (demo.booking.hairsalon.model.enums.BookingStatus.CANCELLED, demo.booking.hairsalon.model.enums.BookingStatus.NO_SHOW) " +
           "AND b.startAt < :endAt AND b.endAt > :startAt")
    List<Booking> findOverlappingBookings(@Param("expertId") UUID expertId,
                                           @Param("startAt") LocalDateTime startAt,
                                           @Param("endAt") LocalDateTime endAt);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId " +
           "AND b.status NOT IN (demo.booking.hairsalon.model.enums.BookingStatus.CANCELLED, demo.booking.hairsalon.model.enums.BookingStatus.NO_SHOW) " +
           "AND b.startAt < :endAt AND b.endAt > :startAt")
    List<Booking> findCustomerOverlappingBookings(@Param("userId") UUID userId,
                                                   @Param("startAt") LocalDateTime startAt,
                                                   @Param("endAt") LocalDateTime endAt);


    @Query("SELECT b FROM Booking b WHERE b.reminderSent = false " +
           "AND b.status IN (demo.booking.hairsalon.model.enums.BookingStatus.PENDING, demo.booking.hairsalon.model.enums.BookingStatus.CONFIRMED) " +
           "AND b.startAt <= :reminderThreshold")
    List<Booking> findUpcomingBookingsForReminder(@Param("reminderThreshold") LocalDateTime reminderThreshold);

    @Query("SELECT b FROM Booking b WHERE b.startAt >= :startOfDay AND b.startAt <= :endOfDay")
    List<Booking> findTodayBookings(@Param("startOfDay") LocalDateTime startOfDay,
                                    @Param("endOfDay") LocalDateTime endOfDay);
}



