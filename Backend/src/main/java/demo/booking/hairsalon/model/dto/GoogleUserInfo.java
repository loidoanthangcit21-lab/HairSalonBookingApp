package demo.booking.hairsalon.model.dto;

public record GoogleUserInfo(
        String googleId,
        String email,
        String firstName,
        String lastName
) {
}