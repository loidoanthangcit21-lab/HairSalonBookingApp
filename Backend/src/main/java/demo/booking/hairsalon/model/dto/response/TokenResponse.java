package demo.booking.hairsalon.model.dto.response;

public record TokenResponse(

        String accessToken,
        String refreshToken

) {
}