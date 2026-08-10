package demo.booking.hairsalon.repository;

import demo.booking.hairsalon.model.entity.StylistPortfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StylistPortfolioRepository extends JpaRepository<StylistPortfolio, UUID> {
}
