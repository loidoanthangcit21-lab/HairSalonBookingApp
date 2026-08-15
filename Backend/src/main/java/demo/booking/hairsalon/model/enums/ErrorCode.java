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
    SERVICE_NOT_FOUND(HttpStatus.NOT_FOUND, "Service not found"),
    STYLIST_NOT_FOUND(HttpStatus.NOT_FOUND, "Stylist not found"),
    BOOKING_NOT_FOUND(HttpStatus.NOT_FOUND, "Booking not found"),
    INVALID_BOOKING_TIME(HttpStatus.BAD_REQUEST, "Invalid booking time"),
    STYLIST_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "Stylist is not available at this time"),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Notification not found"),
    UNAUTHORIZED_ACTION(HttpStatus.FORBIDDEN, "You do not have permission to perform this action");

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