package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.PasswordResetToken;
import demo.booking.hairsalon.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteAllByUser(User user);

}