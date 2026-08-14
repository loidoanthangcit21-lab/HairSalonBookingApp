package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.request.BookingRequest;
import demo.booking.hairsalon.model.dto.response.BookingResponse;
import demo.booking.hairsalon.model.dto.response.SalonServiceResponse;
import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.entity.BookingService;
import demo.booking.hairsalon.model.entity.SalonService;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.BookingStatus;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.model.enums.PaymentStatus;
import demo.booking.hairsalon.repository.BookingRepository;
import demo.booking.hairsalon.repository.BookingServiceRepository;
import demo.booking.hairsalon.repository.SalonServiceRepository;
import demo.booking.hairsalon.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements demo.booking.hairsalon.service.BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SalonServiceRepository salonServiceRepository;
    private final BookingServiceRepository bookingServiceRepository;

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
        return bookingRepository.findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(customer.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));
        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(String customerEmail, UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));
        
        if (!booking.getCustomer().getEmail().equals(customerEmail)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    public List<BookingResponse> getTodayBookings() {
        return bookingRepository.findByAppointmentDateOrderByStartTimeAsc(LocalDate.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse receptionistCreateBooking(BookingRequest request, UUID customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return processBookingCreation(customer, request);
    }

    @Override
    @Transactional
    public void markAsPaid(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));
        booking.setPaymentStatus(PaymentStatus.PAID);
        bookingRepository.save(booking);
    }

    @Override
    public List<BookingResponse> getStylistAssignedJobs(String stylistEmail) {
        User stylist = userRepository.findByEmail(stylistEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        return bookingRepository.findByStylistIdAndStatusIn(stylist.getId(), activeStatuses)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateBookingStatus(String stylistEmail, UUID bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));
        if (booking.getStylist() == null || !booking.getStylist().getEmail().equals(stylistEmail)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }
        booking.setStatus(newStatus);
        bookingRepository.save(booking);
    }

    private BookingResponse processBookingCreation(User customer, BookingRequest request) {
        User stylist = null;
        if (request.stylistId() != null) {
            stylist = userRepository.findById(request.stylistId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.STYLIST_NOT_FOUND));
        }

        int totalDuration = 0;
        double totalAmount = 0.0;
        List<SalonService> selectedServices = new ArrayList<>();

        for (UUID serviceId : request.serviceIds()) {
            SalonService service = salonServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));
            selectedServices.add(service);
            totalDuration += service.getDuration();
            totalAmount += service.getPrice();
        }

        LocalTime endTime = request.startTime().plusMinutes(totalDuration);

        if (stylist != null) {
            List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
            long overlaps = bookingRepository.countOverlappingBookings(
                    stylist.getId(),
                    request.appointmentDate(),
                    request.startTime(),
                    endTime,
                    activeStatuses
            );
            if (overlaps > 0) {
                throw new BusinessException(ErrorCode.STYLIST_NOT_AVAILABLE);
            }
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setStylist(stylist);
        booking.setAppointmentDate(request.appointmentDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(endTime);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        booking.setNotes(request.notes());
        booking.setTotalAmount(totalAmount);

        Booking savedBooking = bookingRepository.save(booking);

        List<demo.booking.hairsalon.model.entity.BookingService> bookingServices = new ArrayList<>();
        for (SalonService service : selectedServices) {
            demo.booking.hairsalon.model.entity.BookingService bs = new demo.booking.hairsalon.model.entity.BookingService();
            bs.setBooking(savedBooking);
            bs.setService(service);
            bs.setPriceAtBooking(service.getPrice());
            bookingServices.add(bs);
        }
        bookingServiceRepository.saveAll(bookingServices);

        return mapToResponse(savedBooking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        List<demo.booking.hairsalon.model.entity.BookingService> services = bookingServiceRepository.findByBookingId(booking.getId());
        List<SalonServiceResponse> serviceResponses = services.stream().map(bs -> new SalonServiceResponse(
                bs.getService().getId(),
                bs.getService().getName(),
                bs.getService().getDescription(),
                bs.getPriceAtBooking(),
                bs.getService().getDuration(),
                bs.getService().getImageUrl()
        )).collect(Collectors.toList());

        return new BookingResponse(
                booking.getId(),
                booking.getCustomer().getId(),
                booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName(),
                booking.getStylist() != null ? booking.getStylist().getId() : null,
                booking.getStylist() != null ? booking.getStylist().getFirstName() + " " + booking.getStylist().getLastName() : null,
                booking.getAppointmentDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus().name(),
                booking.getPaymentStatus().name(),
                booking.getTotalAmount(),
                booking.getNotes(),
                serviceResponses
        );
    }
}
