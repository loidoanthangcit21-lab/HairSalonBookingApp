package demo.booking.hairsalon.service.impl;


import demo.booking.hairsalon.config.TokenProperties;
import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.entity.PasswordResetToken;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.PasswordResetTokenRepository;
import demo.booking.hairsalon.service.PasswordResetTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetTokenServiceImpl
        implements PasswordResetTokenService {

    private final PasswordResetTokenRepository repository;
    private final TokenProperties tokenProperties;

    @Override
    public PasswordResetToken create(User user) {
        repository.deleteAllByUser(user);
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        token.setToken(otp);
        token.setExpiresAt(LocalDateTime.now().plusSeconds(tokenProperties.getPasswordResetExpiration() / 1000));
        return repository.save(token);
    }

    @Override
    public PasswordResetToken validate(String tokenValue) {
        PasswordResetToken token = repository.findByToken(tokenValue).orElseThrow(() ->
                new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_NOT_FOUND));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_EXPIRED);
        }
        return token;
    }

    @Override
    public PasswordResetToken getByUser(User user) {
        return repository.findByUser(user).orElseThrow(() ->
                new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_NOT_FOUND));
    }

    @Override
    public void delete(PasswordResetToken token) {
        repository.delete(token);
    }

}