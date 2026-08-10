package demo.booking.hairsalon.service.impl;


import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.GoogleUserInfo;
import demo.booking.hairsalon.model.dto.request.*;
import demo.booking.hairsalon.model.dto.response.LoginResponse;
import demo.booking.hairsalon.model.dto.response.TokenResponse;
import demo.booking.hairsalon.model.entity.EmailVerificationToken;
import demo.booking.hairsalon.model.entity.PasswordResetToken;
import demo.booking.hairsalon.model.entity.RefreshToken;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.model.enums.Role;
import demo.booking.hairsalon.repository.UserRepository;
import demo.booking.hairsalon.security.CustomUserDetails;
import demo.booking.hairsalon.security.SecurityUtils;
import demo.booking.hairsalon.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.security.AuthProvider;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenService verificationTokenService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final OtpService otpService;
    private final GoogleAuthService googleAuthService;


    @Transactional
    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_IS_EXISTED);
        }
        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setActive(false);
        user.setEmailVerified(false);
        user.setAuthProvider(demo.booking.hairsalon.model.enums.AuthProvider.LOCAL);
        userRepository.save(user);
        demo.booking.hairsalon.model.entity.Otp token = otpService.create(user, demo.booking.hairsalon.model.enums.OtpType.VERIFY_EMAIL);
        emailService.sendVerificationEmail(user.getEmail(), token.getOtpCode());
    }

    @Transactional
    @Override
    public void verifyEmail(String tokenValue) {
        demo.booking.hairsalon.model.entity.Otp token = otpService.validate(tokenValue, demo.booking.hairsalon.model.enums.OtpType.VERIFY_EMAIL);
        User user = token.getUser();
        user.setActive(true);
        user.setEmailVerified(true);
        userRepository.save(user);
        otpService.markAsUsed(token);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new LoginResponse(accessToken, refreshToken.getTokenHash());
    }

    @Override
    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken oldRefreshToken = refreshTokenService.validate(request.refreshToken());
        User user = oldRefreshToken.getUser();
        refreshTokenService.revoke(oldRefreshToken);

        String newAccessToken = jwtService.generateAccessToken(user);
        RefreshToken newRefreshToken = refreshTokenService.create(user);

        return new TokenResponse(newAccessToken, newRefreshToken.getTokenHash());
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {

        RefreshToken refreshToken = refreshTokenService.validate(request.refreshToken());
        refreshTokenService.revoke(refreshToken);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            demo.booking.hairsalon.model.entity.Otp token = otpService.create(user, demo.booking.hairsalon.model.enums.OtpType.RESET_PASSWORD);
                    emailService.sendPasswordResetEmail(
                            user.getEmail(),
                            token.getOtpCode()
                   );
                });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        demo.booking.hairsalon.model.entity.Otp token = otpService.validate(request.token(), demo.booking.hairsalon.model.enums.OtpType.RESET_PASSWORD);
        User user = token.getUser();
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.PASSWORD_SAME_AS_OLD);
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        otpService.markAsUsed(token);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUser();
        User user = currentUser.getUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.WRONG_CURRENT_PASSWORD);
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.PASSWORD_SAME_AS_OLD);
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        refreshTokenService.revokeAll(user);
    }

    @Override
    @Transactional
    public void resendVerificationEmail(ResendVerificationRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            if (user.isActive() && user.isEmailVerified()) {
                throw new BusinessException(ErrorCode.EMAIL_ALREADY_VERIFIED);
            }
            demo.booking.hairsalon.model.entity.Otp token = otpService.create(user, demo.booking.hairsalon.model.enums.OtpType.VERIFY_EMAIL);

            emailService.sendVerificationEmail(user.getEmail(), token.getOtpCode());});
    }

    public LoginResponse googleLogin(GoogleLoginRequest request) {

        GoogleUserInfo googleUser = googleAuthService.verifyIdToken(request.idToken());

        User user = userRepository.findByEmail(googleUser.email()).orElseGet(() -> createGoogleUser(googleUser));

        if (!user.isActive()) {
            user.setActive(true);
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        String accessToken = jwtService.generateAccessToken(user);

        String refreshToken = jwtService.generateRefreshToken(user);

        return new LoginResponse(accessToken, refreshToken);
    }

    private User createGoogleUser(GoogleUserInfo googleUser) {
        User user = new User();
        user.setEmail(googleUser.email());
        user.setFirstName(googleUser.firstName());
        user.setLastName(googleUser.lastName());
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setActive(true);
        user.setEmailVerified(true);
        user.setAuthProvider(demo.booking.hairsalon.model.enums.AuthProvider.GOOGLE);
        user.setRole(Role.CUSTOMER);
        return userRepository.save(user);
    }
}
