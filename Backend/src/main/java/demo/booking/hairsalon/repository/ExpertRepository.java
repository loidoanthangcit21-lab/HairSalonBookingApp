package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.Expert;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpertRepository extends JpaRepository<Expert, UUID> {
    List<Expert> findByIsActiveTrue();

    @Query("SELECT DISTINCT e FROM Expert e JOIN e.expertCategories ec WHERE ec.category.id = :categoryId AND e.isActive = true")
    List<Expert> findActiveExpertsByCategoryId(@Param("categoryId") UUID categoryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Expert e WHERE e.id = :id")
    Optional<Expert> findByIdWithLock(@Param("id") UUID id);
}

