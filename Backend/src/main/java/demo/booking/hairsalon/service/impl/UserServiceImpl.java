package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.model.dto.request.UpdateProfileRequest;
import demo.booking.hairsalon.model.dto.response.UserResponse;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.repository.UserRepository;
import demo.booking.hairsalon.security.SecurityUtils;
import demo.booking.hairsalon.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import demo.booking.hairsalon.common.PageResponse;
import demo.booking.hairsalon.model.dto.request.ChangeRoleRequest;
import demo.booking.hairsalon.model.dto.request.ChangeStatusRequest;
import demo.booking.hairsalon.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.UUID;
import java.util.stream.Collectors;
import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.enums.ErrorCode;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getMyProfile() {
        User user = SecurityUtils.getCurrentUser().getUser();
        
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .authProvider(user.getAuthProvider().name())
                .emailVerified(user.isEmailVerified())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        User user = SecurityUtils.getCurrentUser().getUser();
        
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        
        userRepository.save(user);
        
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .authProvider(user.getAuthProvider().name())
                .emailVerified(user.isEmailVerified())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .authProvider(user.getAuthProvider().name())
                .emailVerified(user.isEmailVerified())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(int page, int size, Role role) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<User> userPage;
        
        if (role != null) {
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        
        return PageResponse.<UserResponse>builder()
                .pageNo(page)
                .pageSize(size)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .content(userPage.getContent().stream().map(this::mapToUserResponse).collect(Collectors.toList()))
                .build();
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse changeUserRole(UUID id, ChangeRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
                
        user.setRole(Role.valueOf(request.role()));
        userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse changeUserStatus(UUID id, ChangeStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
                
        user.setActive(request.isActive());
        userRepository.save(user);
        return mapToUserResponse(user);
    }
}
