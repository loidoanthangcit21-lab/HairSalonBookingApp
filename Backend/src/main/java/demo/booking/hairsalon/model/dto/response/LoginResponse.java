package demo.booking.hairsalon.model.dto.response;

public record LoginResponse(

        String accessToken,

        String refreshToken

) {
}