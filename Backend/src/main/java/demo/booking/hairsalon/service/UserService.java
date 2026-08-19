package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.UpdateProfileRequest;
import demo.booking.hairsalon.model.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
