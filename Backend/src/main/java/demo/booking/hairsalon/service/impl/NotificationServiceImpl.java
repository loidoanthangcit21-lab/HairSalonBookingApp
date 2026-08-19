package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.response.NotificationResponse;
import demo.booking.hairsalon.model.entity.Notification;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.model.enums.NotificationType;
import demo.booking.hairsalon.repository.NotificationRepository;
import demo.booking.hairsalon.repository.UserRepository;
import demo.booking.hairsalon.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<NotificationResponse> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(UUID id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void sendNotification(User user, String title, String message, String typeStr) {
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            
            NotificationType type;
            try {
                type = NotificationType.valueOf(typeStr.toUpperCase());
            } catch (Exception e) {
                type = NotificationType.BOOKING_CONFIRMED;
            }
            notification.setType(type);
            
            notificationRepository.save(notification);

            NotificationResponse response = mapToResponse(notification);

            messagingTemplate.convertAndSendToUser(
                    user.getEmail() != null ? user.getEmail() : user.getId().toString(),
                    "/queue/notifications",
                    response
            );
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", e.getMessage());
        }
    }

    @Override
    public void sendBookingUpdate(User user, demo.booking.hairsalon.model.dto.response.BookingResponse booking) {
        try {
            // Broadcast to public topic for instant occupied slot refresh across all clients
            messagingTemplate.convertAndSend("/topic/occupied-slots", booking);

            // Push to individual user queue if customer exists
            if (user != null && user.getEmail() != null) {
                messagingTemplate.convertAndSendToUser(
                        user.getEmail(),
                        "/queue/booking-updates",
                        booking
                );
            }
        } catch (Exception e) {
            log.error("Failed to send booking update: {}", e.getMessage());
        }
    }


    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null,
                notification.isRead(),
                notification.getType() != null ? notification.getType().name().toLowerCase() : "booking_confirmed"
        );
    }
}
