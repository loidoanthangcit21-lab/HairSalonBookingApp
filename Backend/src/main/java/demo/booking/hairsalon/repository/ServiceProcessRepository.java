package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.ServiceProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ServiceProcessRepository extends JpaRepository<ServiceProcess, UUID> {
}
