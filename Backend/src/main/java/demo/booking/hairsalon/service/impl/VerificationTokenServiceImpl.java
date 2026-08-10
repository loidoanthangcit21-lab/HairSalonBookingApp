package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.config.TokenProperties;
import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.entity.EmailVerificationToken;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.EmailVerificationTokenRepository;
import demo.booking.hairsalon.service.VerificationTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationTokenServiceImpl implements VerificationTokenService {

    private final EmailVerificationTokenRepository repository;
    private final TokenProperties tokenProperties;

    @Override
    public EmailVerificationToken create(User user) {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now()
                .plus(Duration.ofMillis(tokenProperties.getVerificationExpiration())));
        return repository.save(token);
    }

    @Override
    public EmailVerificationToken getByToken(String token) {
        return repository.findByToken(token).orElseThrow(() -> new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN));
    }

    @Override
    public void validate(EmailVerificationToken token) {
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
        }

    }

    @Override
    public void delete(EmailVerificationToken token) {
        repository.delete(token);
    }

    @Override
    public void deleteByUser(User user) {
        repository.deleteByUser(user);
    }


}