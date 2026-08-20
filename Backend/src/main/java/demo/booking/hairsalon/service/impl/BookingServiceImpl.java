package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.request.BookingRequest;
import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.model.dto.response.ServiceResponse;
import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.entity.Expert;
import demo.booking.hairsalon.model.entity.Service;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.BookingStatus;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.BookingRepository;
import demo.booking.hairsalon.repository.ExpertRepository;
import demo.booking.hairsalon.repository.ServiceRepository;
import demo.booking.hairsalon.repository.UserRepository;
import demo.booking.hairsalon.service.BookingService;
import demo.booking.hairsalon.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {


    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final ExpertRepository expertRepository;
    private final NotificationService notificationService;

    // Customer

    @Override
    @Transactional
    public BookingResponse createBooking(String customerEmail, BookingRequest request) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return processBookingCreation(customer, request);
    }

    @Override
    public List<BookingResponse> getMyBookings(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return bookingRepository.findByUserId(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));
        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(String customerEmail, UUID bookingId, BookingRequest request) {
        Booking oldBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));

        if (oldBooking.getUser() != null && !oldBooking.getUser().getEmail().equals(customerEmail)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        // Cancel old booking then create a new one (reschedule)
        oldBooking.setStatus(BookingStatus.CANCELLED);
        oldBooking.setCancelledAt(LocalDateTime.now());
        oldBooking.setCancelReason("Rescheduled");
        bookingRepository.save(oldBooking);

        User customer = oldBooking.getUser();
        BookingResponse newBooking = processBookingCreation(customer, request);

        if (customer != null) {
            notificationService.sendBookingUpdate(customer, newBooking);
        }
        return newBooking;
    }

    @Override
    @Transactional
    public void cancelBooking(String customerEmail, UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getUser() != null && !booking.getUser().getEmail().equals(customerEmail)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelReason("Cancelled by user");
        bookingRepository.save(booking);

        User customer = booking.getUser();
        if (customer != null) {
            BookingResponse response = mapToResponse(booking);
            notificationService.sendBookingUpdate(customer, response);
            notificationService.sendNotification(
                    customer,
                    "Booking Cancelled",
                    "Your appointment has been cancelled.",
                    "BOOKING_CANCELLED"
            );
        }
    }

    //Admin

    @Override
    public List<BookingResponse> getTodayBookings() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        return bookingRepository.findTodayBookings(startOfDay, endOfDay)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getStaffCreatedBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse cashierCreateBooking(BookingRequest request) {
        return processBookingCreation(null, request);
    }


    @Override
    @Transactional
    public void updateBookingStatus(UUID bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() == newStatus) return;

        // State Machine validation
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.INVALID_BOOKING_STATE);
        }

        if (newStatus == BookingStatus.CHECK_IN) {
            if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new BusinessException(ErrorCode.INVALID_BOOKING_STATE);
            }
            LocalDateTime now = LocalDateTime.now();
            // Admin can check-in anytime, no strict time validation needed.
            booking.setCheckedInAt(now);
        } else if (newStatus == BookingStatus.COMPLETED) {
            LocalDateTime now = LocalDateTime.now();
            booking.setCompletedAt(now);
            if (now.isBefore(booking.getEndAt())) {
                booking.setEndAt(now);
            }
        } else if (newStatus == BookingStatus.CANCELLED) {
            booking.setCancelledAt(LocalDateTime.now());
        }
        
        booking.setStatus(newStatus);
        bookingRepository.save(booking);

        User customer = booking.getUser();
        if (customer != null) {
            BookingResponse response = mapToResponse(booking);
            notificationService.sendBookingUpdate(customer, response);

            String title;
            String message;
            String type;
            switch (newStatus) {
                case CONFIRMED -> {
                    title = "Appointment Confirmed";
                    message = "Your appointment on " +
                            (booking.getStartAt() != null ? booking.getStartAt().toLocalDate() : "") +
                            " has been confirmed!";
                    type = "BOOKING_CONFIRMED";
                }
                case CANCELLED -> {
                    title = "Appointment Cancelled";
                    message = "Your appointment has been cancelled.";
                    type = "BOOKING_CANCELLED";
                }
                case COMPLETED -> {
                    title = "Appointment Completed";
                    message = "Thank you for visiting! Your session is completed.";
                    type = "BOOKING_COMPLETED";
                }
                case CHECK_IN -> {
                    title = "Checked In ";
                    message = "Welcome to the salon! You have checked in.";
                    type = "BOOKING_CONFIRMED";
                }
                default -> {
                    title = "Booking Status Updated";
                    message = "Your appointment status has been updated to " + newStatus.name();
                    type = "BOOKING_CONFIRMED";
                }
            }
            notificationService.sendNotification(customer, title, message, type);
        }
    }

    //Stylist

    @Override
    public List<BookingResponse> getStylistAssignedJobs(String stylistEmail) {
        User user = userRepository.findByEmail(stylistEmail).orElse(null);
        if (user == null) {
            return List.of();
        }
        return bookingRepository.findByExpertNameOrPhone(user.getFullName(), user.getPhone()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    //  Shared/Internal

    @Override
    public List<BookingResponse> getAllActiveBookings() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING
                        || b.getStatus() == BookingStatus.CONFIRMED
                        || b.getStatus() == BookingStatus.CHECK_IN)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //Private helpers

    private BookingResponse processBookingCreation(User customer, BookingRequest request) {
        // Resolve expert (with pessimistic write lock for race-condition safety)
        Expert expert = null;
        UUID expertId = request.expertId() != null ? request.expertId() : request.stylistId();
        if (expertId != null) {
            expert = expertRepository.findByIdWithLock(expertId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.EXPERT_NOT_FOUND));
            if (!expert.isActive()) {
                throw new BusinessException(ErrorCode.EXPERT_NOT_AVAILABLE);
            }
        }

        //Resolve services
        if (request.serviceIds() == null || request.serviceIds().isEmpty()) {
            throw new BusinessException(ErrorCode.SERVICE_NOT_FOUND);
        }
        List<Service> services = serviceRepository.findAllById(request.serviceIds());
        if (services.isEmpty()) {
            throw new BusinessException(ErrorCode.SERVICE_NOT_FOUND);
        }

        //Parse date/time
        LocalDate parsedDate = LocalDate.parse(request.bookingDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LocalTime parsedTime = LocalTime.parse(request.timeSlot().toUpperCase(), DateTimeFormatter.ofPattern("hh:mm a", Locale.US));
        LocalDateTime startAt = LocalDateTime.of(parsedDate, parsedTime);
        if (startAt.isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.INVALID_BOOKING_TIME);
        }
        
        int totalDuration = services.stream().mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 45).sum();
        if (totalDuration == 0) totalDuration = 45; // Default fallback if missing duration
        LocalDateTime endAt = startAt.plusMinutes(totalDuration);


        //Customer overlap check (same customer, same time window)
        if (customer != null) {
            List<Booking> customerOverlaps = bookingRepository.findCustomerOverlappingBookings(
                    customer.getId(), startAt, endAt);
            if (!customerOverlaps.isEmpty()) {
                throw new BusinessException(ErrorCode.CUSTOMER_HAS_OVERLAPPING_BOOKING);
            }
        }

        //Expert overlap check (same expert, same time window)
        if (expert != null) {
            List<Booking> expertOverlaps = bookingRepository.findOverlappingBookings(
                    expert.getId(), startAt, endAt);
            if (!expertOverlaps.isEmpty()) {
                throw new BusinessException(ErrorCode.EXPERT_NOT_AVAILABLE);
            }
        }

        Booking booking = Booking.builder()
                .user(customer)
                .services(services)
                .expert(expert)
                .startAt(startAt)
                .endAt(endAt)
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking;
        try {
            savedBooking = bookingRepository.saveAndFlush(booking);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // DB unique constraint (uk_expert_start_at) caught race condition
            throw new BusinessException(ErrorCode.EXPERT_NOT_AVAILABLE);
        }

        BookingResponse response = mapToResponse(savedBooking);

        //Send real-time events to customer
        if (customer != null) {
            String serviceName = services.isEmpty() ? "N/A" : services.get(0).getName() + (services.size() > 1 ? " and " + (services.size() - 1) + " other(s)" : "");
            String dateStr = request.bookingDate() + " at " + request.timeSlot();
            notificationService.sendBookingUpdate(customer, response);
            notificationService.sendNotification(
                    customer,
                    "Booking Placed Successfully",
                    "Your booking for " + serviceName + " on " + dateStr + " is currently PENDING.",
                    "BOOKING_CONFIRMED"
            );
        }

        return response;
    }

    private BookingResponse mapToResponse(Booking booking) {
        List<Service> services = booking.getServices();
        List<ServiceResponse> serviceResponses = services != null ? services.stream()
                .map(s -> new ServiceResponse(
                        s.getId(),
                        s.getName(),
                        s.getDescription(),
                        s.getPrice(),
                        s.getImageUrl(),
                        s.getCategory() != null ? s.getCategory().getId() : null,
                        s.getCategory() != null ? s.getCategory().getName() : null))
                .collect(Collectors.toList()) : List.of();

        String timeStr = booking.getStartAt() != null
                ? booking.getStartAt().format(DateTimeFormatter.ofPattern("hh:mm a", Locale.US))
                : null;
        String dateStr = booking.getStartAt() != null
                ? booking.getStartAt().toLocalDate().toString()
                : null;
        String createdStr = booking.getCreatedAt() != null
                ? booking.getCreatedAt().toString()
                : null;

        return new BookingResponse(
                booking.getId(),
                "BK-" + (booking.getId() != null ? booking.getId().toString().substring(0, 8) : "0000"),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? booking.getUser().getFullName() : null,
                booking.getUser() != null ? booking.getUser().getPhone() : null,
                booking.getExpert() != null ? booking.getExpert().getId() : null,
                booking.getExpert() != null ? booking.getExpert().getFullName() : null,
                dateStr,
                timeStr,
                booking.getStatus() != null ? booking.getStatus().name() : null,
                booking.getStatus() == BookingStatus.COMPLETED ? "PAID" : "UNPAID",
                services != null ? services.stream().mapToDouble(s -> s.getPrice() != null ? s.getPrice().doubleValue() : 0.0).sum() : 0.0,
                booking.getCancelReason(),
                false,
                "Online",
                createdStr,
                serviceResponses
        );
    }
}
