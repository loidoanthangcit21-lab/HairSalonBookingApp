package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.model.dto.response.NotificationResponse;
import demo.booking.hairsalon.model.entity.User;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> getUserNotifications(String email);
    void markAsRead(UUID id, String email);
    void sendNotification(User user, String title, String message, String type);
    void sendBookingUpdate(User user, BookingResponse booking);
}

