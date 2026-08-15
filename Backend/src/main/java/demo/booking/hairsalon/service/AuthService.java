package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.*;
import demo.booking.hairsalon.model.dto.response.LoginResponse;
import demo.booking.hairsalon.model.dto.response.MessageResponse;
import demo.booking.hairsalon.model.dto.response.TokenResponse;

public interface AuthService {

    void register(RegisterRequest request);

    void verifyEmail(demo.booking.hairsalon.model.dto.request.VerifyEmailRequest request);

    LoginResponse login(LoginRequest request);

    TokenResponse refreshToken(RefreshTokenRequest request);

    void logout(LogoutRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(ChangePasswordRequest request);

    void resendVerificationEmail(ResendVerificationRequest request);

    LoginResponse googleLogin(GoogleLoginRequest request);
}