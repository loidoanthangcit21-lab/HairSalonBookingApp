package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.GoogleUserInfo;

public interface GoogleAuthService {

    GoogleUserInfo verifyIdToken(String idToken);

}