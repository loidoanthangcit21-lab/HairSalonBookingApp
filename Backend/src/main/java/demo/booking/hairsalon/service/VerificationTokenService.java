package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.entity.EmailVerificationToken;
import demo.booking.hairsalon.model.entity.User;

public interface VerificationTokenService {

    EmailVerificationToken create(User user);

    EmailVerificationToken getByToken(String token);

    void validate(EmailVerificationToken token);

    void delete(EmailVerificationToken token);

    void deleteByUser(User user);
}