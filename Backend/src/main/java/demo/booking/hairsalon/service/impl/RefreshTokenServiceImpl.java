package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.config.JwtProperties;
import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.entity.RefreshToken;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.RefreshTokenRepository;
import demo.booking.hairsalon.service.JwtService;
import demo.booking.hairsalon.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    @Override
    public RefreshToken create(User user) {
        String jwtRefreshToken = jwtService.generateRefreshToken(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenHash(jwtRefreshToken);
        refreshToken.setUser(user);
        refreshToken.setExpiredAt(LocalDateTime.now().plusSeconds(jwtProperties.getRefreshExpiration() / 1000));
        refreshToken.setRevoked(false);
        return repository.save(refreshToken);
    }

    @Override
    public RefreshToken getByToken(String token) {

        return repository.findByTokenHash(token).orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
    }

    @Override
    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        repository.save(token);
    }

    @Override
    public RefreshToken validate(String tokenValue) {
        RefreshToken refreshToken =
                getByToken(tokenValue);
        if (refreshToken.isRevoked()) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_REVOKED);
        }
        if (jwtService.isTokenExpired(refreshToken.getTokenHash())) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }
        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeAll(User user) {
        List<RefreshToken> tokens = repository.findAllByUser(user);
        tokens.forEach(token -> token.setRevoked(true));
        repository.saveAll(tokens);
    }
}