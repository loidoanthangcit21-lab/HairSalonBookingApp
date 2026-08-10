package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.Stylist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StylistRepository extends JpaRepository<Stylist, UUID> {
}
