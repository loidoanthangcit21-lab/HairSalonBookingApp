package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.entity.PasswordResetToken;
import demo.booking.hairsalon.model.entity.User;

public interface PasswordResetTokenService {

    PasswordResetToken create(User user);

    PasswordResetToken validate(String token);

    PasswordResetToken getByUser(User user);

    void delete(PasswordResetToken token);

}