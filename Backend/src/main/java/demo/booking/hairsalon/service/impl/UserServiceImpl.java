package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.request.UpdateProfileRequest;
import demo.booking.hairsalon.model.dto.response.UserProfileResponse;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.UserRepository;
import demo.booking.hairsalon.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return mapToResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (request.firstName() != null || request.lastName() != null) {
            String fName = request.firstName() != null ? request.firstName() : "";
            String lName = request.lastName() != null ? request.lastName() : "";
            user.setFullName((fName + " " + lName).trim());
        }
        if (request.phoneNumber() != null) {
            user.setPhone(request.phoneNumber());
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    private UserProfileResponse mapToResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                null,
                user.getRole() != null ? user.getRole().name() : "CUSTOMER",
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
