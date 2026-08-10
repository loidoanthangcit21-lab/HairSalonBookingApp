package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findByOtpCode(String otpCode);
}
