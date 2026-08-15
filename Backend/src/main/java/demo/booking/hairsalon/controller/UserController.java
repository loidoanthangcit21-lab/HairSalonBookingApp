package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.UpdateProfileRequest;
import demo.booking.hairsalon.model.dto.response.UserProfileResponse;
import demo.booking.hairsalon.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final demo.booking.hairsalon.service.AuthService authService; // to inject authService

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserProfileResponse> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(userService.getProfile(email), "Profile retrieved successfully", null);
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(userService.updateProfile(email, request), "Profile updated successfully", null);
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> changePassword(@Valid @RequestBody demo.booking.hairsalon.model.dto.request.ChangePasswordRequest request) {
        authService.changePassword(request);
        return ApiResponse.success(null, "Password changed successfully", null);
    }

    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<java.util.List<Object>> getNotifications() {
        return ApiResponse.success(java.util.Collections.emptyList(), "Notifications retrieved successfully", null);
    }
}
