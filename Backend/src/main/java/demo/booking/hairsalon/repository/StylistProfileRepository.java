package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.StylistProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StylistProfileRepository extends JpaRepository<StylistProfile, UUID> {
    Optional<StylistProfile> findByUserId(UUID userId);
}
