package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.entity.RefreshToken;
import demo.booking.hairsalon.model.entity.User;

public interface RefreshTokenService {

    RefreshToken create(User user);

    RefreshToken getByToken(String token);

    void revoke(RefreshToken token);

    RefreshToken validate(String token);

    void revokeAll(User user);
}