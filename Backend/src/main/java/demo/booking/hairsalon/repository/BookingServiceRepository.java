package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.BookingService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingServiceRepository extends JpaRepository<BookingService, UUID> {
    List<BookingService> findByBookingId(UUID bookingId);
}
