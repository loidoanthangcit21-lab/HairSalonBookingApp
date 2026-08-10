package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.RefreshToken;
import demo.booking.hairsalon.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUser(User user);
}