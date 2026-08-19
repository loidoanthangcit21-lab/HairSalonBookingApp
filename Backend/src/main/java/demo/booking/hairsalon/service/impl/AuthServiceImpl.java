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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private String formatFullName(String firstName, String lastName) {
        String fName = firstName != null ? firstName.trim() : "";
        String lName = lastName != null && !"null".equalsIgnoreCase(lastName.trim()) ? lastName.trim() : "";
        if (!fName.isEmpty() && !lName.isEmpty()) {
            return fName + " " + lName;
        } else if (!fName.isEmpty()) {
            return fName;
        } else if (!lName.isEmpty()) {
            return lName;
        }
        return "User";
    }

    @Transactional
    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_IS_EXISTED);
        }
        String fullName = request.fullName() != null && !request.fullName().isBlank() ? request.fullName().trim() : "User";
        String phone = (request.phone() != null && !request.phone().isBlank()) ? request.phone().trim() : "";
        User user = User.builder()
                .fullName(fullName)
                .email(request.email())
                .phone(phone)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.CUSTOMER)
                .enabled(false)
                .build();
        userRepository.save(user);
        EmailVerificationToken token = verificationTokenService.create(user);
        emailService.sendVerificationEmail(user.getEmail(), token.getToken());
    }



    @Transactional
    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        EmailVerificationToken token = verificationTokenService.getByUser(user);
        
        if (!token.getToken().equals(request.otp())) {
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }
        
        verificationTokenService.validate(token);
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
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        PasswordResetToken token = passwordResetTokenService.getByUser(user);
        
        if (!token.getToken().equals(request.otp())) {
            throw new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_NOT_FOUND);
        }
        
        passwordResetTokenService.validate(token.getToken());
        
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
            emailService.sendVerificationEmail(user.getEmail(), token.getToken());
        });
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
        String fullName = formatFullName(googleUser.firstName(), googleUser.lastName());
        User user = User.builder()
                .email(googleUser.email())
                .fullName(fullName)
                .phone("")
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .enabled(true)
                .role(Role.CUSTOMER)
                .build();
        return userRepository.save(user);
    }

}
