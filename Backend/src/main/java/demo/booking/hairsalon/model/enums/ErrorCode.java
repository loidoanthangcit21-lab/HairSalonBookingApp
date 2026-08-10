package demo.booking.hairsalon.model.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    EMAIL_IS_EXISTED(HttpStatus.BAD_REQUEST, "Email is already exist"),
    EMAIL_ALREADY_VERIFIED(HttpStatus.BAD_REQUEST, "Email is already verified"),
    PASSWORD_SAME_AS_OLD(HttpStatus.BAD_REQUEST, "New password cannot be the same as the old password"),
    WRONG_CURRENT_PASSWORD(HttpStatus.BAD_REQUEST, "Current password is incorrect"),
    TOKEN_EXPIRED(HttpStatus.BAD_REQUEST, "Token is expired"),
    INVALID_VERIFICATION_TOKEN(HttpStatus.BAD_REQUEST, "Invalid verification token"),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.BAD_REQUEST, "Refresh token not found"),
    REFRESH_TOKEN_REVOKED(HttpStatus.BAD_REQUEST, "Refresh token is revoked"),
    REFRESH_TOKEN_EXPIRED(HttpStatus.BAD_REQUEST, "Refresh token has expired"),
    PASSWORD_RESET_TOKEN_NOT_FOUND(HttpStatus.BAD_REQUEST, "Password reset token not found"),
    PASSWORD_RESET_TOKEN_EXPIRED(HttpStatus.BAD_REQUEST, "Password reset token has expired"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    INVALID_GOOGLE_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid Google ID token"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "Authentication is required"),
    INVALID_OTP(HttpStatus.BAD_REQUEST, "Invalid or expired OTP"),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "Category not found"),
    CATEGORY_NAME_IS_EXISTED(HttpStatus.BAD_REQUEST, "Category name already exists"),
    SERVICE_NOT_FOUND(HttpStatus.NOT_FOUND, "Service not found"),
    SERVICE_NAME_IS_EXISTED(HttpStatus.BAD_REQUEST, "Service name already exists");

    private final HttpStatus status;
    private final String message;

    ErrorCode(
            HttpStatus status,
            String message
    ) {
        this.status = status;
        this.message = message;
    }
}