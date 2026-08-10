package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.StylistSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StylistScheduleRepository extends JpaRepository<StylistSchedule, UUID> {
}
