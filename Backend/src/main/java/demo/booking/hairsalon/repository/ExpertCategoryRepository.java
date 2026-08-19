package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.ExpertCategory;
import demo.booking.hairsalon.model.entity.ExpertCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpertCategoryRepository extends JpaRepository<ExpertCategory, ExpertCategoryId> {
    List<ExpertCategory> findByExpertId(UUID expertId);
    List<ExpertCategory> findByCategoryId(UUID categoryId);
    boolean existsByIdExpertIdAndIdCategoryId(UUID expertId, UUID categoryId);
}
