package demo.booking.hairsalon.security;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.enums.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static CustomUserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        return (CustomUserDetails) authentication.getPrincipal();
    }
}