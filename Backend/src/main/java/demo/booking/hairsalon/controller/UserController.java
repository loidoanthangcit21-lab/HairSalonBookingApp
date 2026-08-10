package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.response.UserResponse;
import demo.booking.hairsalon.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import demo.booking.hairsalon.model.dto.request.UpdateProfileRequest;

import demo.booking.hairsalon.common.PageResponse;
import demo.booking.hairsalon.model.dto.request.ChangeRoleRequest;
import demo.booking.hairsalon.model.dto.request.ChangeStatusRequest;
import demo.booking.hairsalon.model.enums.Role;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyProfile() {
        return ApiResponse.success(userService.getMyProfile(), "Profile retrieved successfully", null);
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userService.updateMyProfile(request), "Profile updated successfully", null);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Role role) {
        return ApiResponse.success(userService.getAllUsers(page, size, role), "Users retrieved successfully", null);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> getUserById(@PathVariable UUID id) {
        return ApiResponse.success(userService.getUserById(id), "User retrieved successfully", null);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> changeUserRole(
            @PathVariable UUID id, 
            @Valid @RequestBody ChangeRoleRequest request) {
        return ApiResponse.success(userService.changeUserRole(id, request), "User role updated successfully", null);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> changeUserStatus(
            @PathVariable UUID id, 
            @Valid @RequestBody ChangeStatusRequest request) {
        return ApiResponse.success(userService.changeUserStatus(id, request), "User status updated successfully", null);
    }
}
