package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.StylistSpecialty;
import demo.booking.hairsalon.model.entity.StylistSpecialtyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StylistSpecialtyRepository extends JpaRepository<StylistSpecialty, StylistSpecialtyId> {
}
