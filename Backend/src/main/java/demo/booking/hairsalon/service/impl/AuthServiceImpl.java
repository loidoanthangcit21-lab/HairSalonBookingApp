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
    private final PasswordResetTokenService passwordResetTokenService;
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
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setEnabled(false);
        userRepository.save(user);
        EmailVerificationToken token = verificationTokenService.create(user);
        emailService.sendVerificationEmail(user.getEmail(), token.getToken());
    }

    @Transactional
    @Override
    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = verificationTokenService.getByToken(tokenValue);
        verificationTokenService.validate(token);
        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        verificationTokenService.delete(token);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new LoginResponse(accessToken, refreshToken.getToken());
    }

    @Override
    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken oldRefreshToken = refreshTokenService.validate(request.refreshToken());
        User user = oldRefreshToken.getUser();
        refreshTokenService.revoke(oldRefreshToken);

        String newAccessToken = jwtService.generateAccessToken(user);
        RefreshToken newRefreshToken = refreshTokenService.create(user);

        return new TokenResponse(newAccessToken, newRefreshToken.getToken());
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
            PasswordResetToken token = passwordResetTokenService.create(user);
                    emailService.sendPasswordResetEmail(
                            user.getEmail(),
                            token.getToken()
                   );
                });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenService.validate(request.token());
        User user = token.getUser();
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_SAME_AS_OLD);
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        passwordResetTokenService.delete(token);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUser();
        User user = currentUser.getUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.WRONG_CURRENT_PASSWORD);
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_SAME_AS_OLD);
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        refreshTokenService.revokeAll(user);
    }

    @Override
    @Transactional
    public void resendVerificationEmail(ResendVerificationRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            if (user.isEnabled()) {
                throw new BusinessException(ErrorCode.EMAIL_ALREADY_VERIFIED);
            }
            verificationTokenService.deleteByUser(user);
            EmailVerificationToken token = verificationTokenService.create(user);

            emailService.sendVerificationEmail(user.getEmail(), token.getToken());});
    }

    public LoginResponse googleLogin(GoogleLoginRequest request) {

        GoogleUserInfo googleUser = googleAuthService.verifyIdToken(request.idToken());

        User user = userRepository.findByEmail(googleUser.email()).orElseGet(() -> createGoogleUser(googleUser));

        if (!user.isEnabled()) {
            user.setEnabled(true);
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
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setEnabled(true);
        user.setRole(Role.CUSTOMER);
        return userRepository.save(user);
    }
}
