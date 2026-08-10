package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {
    boolean existsByName(String name);
}
