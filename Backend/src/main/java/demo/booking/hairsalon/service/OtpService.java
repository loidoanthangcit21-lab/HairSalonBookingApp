package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.entity.Otp;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.OtpType;

public interface OtpService {
    Otp create(User user, OtpType type);
    
    Otp validate(String otpCode, OtpType type);
    
    void markAsUsed(Otp otp);
    
    void deleteByUser(User user);
}
