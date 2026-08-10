package demo.booking.hairsalon.service;

import demo.booking.hairsalon.common.PageResponse;
import demo.booking.hairsalon.model.dto.request.ChangeRoleRequest;
import demo.booking.hairsalon.model.dto.request.ChangeStatusRequest;
import demo.booking.hairsalon.model.dto.request.UpdateProfileRequest;
import demo.booking.hairsalon.model.dto.response.UserResponse;
import demo.booking.hairsalon.model.enums.Role;

import java.util.UUID;

public interface UserService {
    UserResponse getMyProfile();
    
    UserResponse updateMyProfile(UpdateProfileRequest request);

    PageResponse<UserResponse> getAllUsers(int page, int size, Role role);

    UserResponse getUserById(UUID id);

    UserResponse changeUserRole(UUID id, ChangeRoleRequest request);

    UserResponse changeUserStatus(UUID id, ChangeStatusRequest request);
}
