package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.ExpertImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpertImageRepository extends JpaRepository<ExpertImage, UUID> {
    List<ExpertImage> findByExpertIdOrderByDisplayOrderAsc(UUID expertId);
}
