package demo.booking.hairsalon.config;

import demo.booking.hairsalon.model.entity.SalonService;
import demo.booking.hairsalon.model.entity.StylistProfile;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.Role;
import demo.booking.hairsalon.repository.SalonServiceRepository;
import demo.booking.hairsalon.repository.StylistProfileRepository;
import demo.booking.hairsalon.repository.UserRepository;
import demo.booking.hairsalon.model.entity.Booking;
import demo.booking.hairsalon.model.entity.BookingService;
import demo.booking.hairsalon.model.enums.BookingStatus;
import demo.booking.hairsalon.model.enums.PaymentStatus;
import demo.booking.hairsalon.repository.BookingRepository;
import demo.booking.hairsalon.repository.BookingServiceRepository;
import demo.booking.hairsalon.model.entity.ServiceCategory;
import demo.booking.hairsalon.repository.ServiceCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StylistProfileRepository stylistProfileRepository;
    private final SalonServiceRepository salonServiceRepository;
    private final BookingRepository bookingRepository;
    private final BookingServiceRepository bookingServiceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Initializing mock data...");

        // 1. Initialize Users (Cashier & Stylists)
        if (userRepository.count() == 0) {
            log.info("Creating initial users...");

            // Create Cashier
            User cashier = new User();
            cashier.setFirstName("Thu");
            cashier.setLastName("Ngan");
            cashier.setEmail("cashier@example.com");
            cashier.setPassword(passwordEncoder.encode("password123"));
            cashier.setRole(Role.CASHIER);
            cashier.setEnabled(true);
            userRepository.save(cashier);

            // Create Stylist 1
            User stylist1 = new User();
            stylist1.setFirstName("Kha");
            stylist1.setLastName("Banh");
            stylist1.setEmail("stylist1@example.com");
            stylist1.setPassword(passwordEncoder.encode("password123"));
            stylist1.setRole(Role.STYLIST);
            stylist1.setEnabled(true);
            stylist1.setAvatarUrl("https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=256&h=256");
            userRepository.save(stylist1);

            StylistProfile profile1 = new StylistProfile();
            profile1.setUser(stylist1);
            profile1.setBio("Chuyên gia tạo mẫu tóc nam với phong cách hiện đại, trẻ trung.");
            profile1.setExperienceYears(5);
            profile1.setRating(4.8);
            stylistProfileRepository.save(profile1);

            // Create Stylist 2
            User stylist2 = new User();
            stylist2.setFirstName("Tuan");
            stylist2.setLastName("Ngoc");
            stylist2.setEmail("stylist2@example.com");
            stylist2.setPassword(passwordEncoder.encode("password123"));
            stylist2.setRole(Role.STYLIST);
            stylist2.setEnabled(true);
            stylist2.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256");
            userRepository.save(stylist2);

            StylistProfile profile2 = new StylistProfile();
            profile2.setUser(stylist2);
            profile2.setBio("Stylist nữ dịu dàng, chu đáo, tư vấn nhiệt tình mọi kiểu tóc uốn nhuộm.");
            profile2.setExperienceYears(3);
            profile2.setRating(4.9);
            stylistProfileRepository.save(profile2);

            // Create sample Customer
            User customer = new User();
            customer.setFirstName("User");
            customer.setLastName("1");
            customer.setEmail("khachhang1@example.com");
            customer.setPassword(passwordEncoder.encode("password123"));
            customer.setRole(Role.CUSTOMER);
            customer.setEnabled(true);
            customer.setPhoneNumber("0901234567");
            userRepository.save(customer);

            customer = new User();
            customer.setFirstName("User");
            customer.setLastName("2");
            customer.setEmail("khachhang2@example.com");
            customer.setPassword(passwordEncoder.encode("password123"));
            customer.setRole(Role.CUSTOMER);
            customer.setEnabled(true);
            customer.setPhoneNumber("0987654321");
            userRepository.save(customer);

            log.info("Users and Profiles initialized successfully.");
        } else {
            log.info("Users already exist. Skipping initialization.");
        }

        // 2. Initialize Salon Services and Categories
        if (serviceCategoryRepository.count() == 0) {
            log.info("Creating initial service categories...");
            ServiceCategory cat1 = new ServiceCategory();
            cat1.setName("Haircut");
            serviceCategoryRepository.save(cat1);

            ServiceCategory cat2 = new ServiceCategory();
            cat2.setName("Styling & Perm");
            serviceCategoryRepository.save(cat2);

            ServiceCategory cat3 = new ServiceCategory();
            cat3.setName("Coloring");
            serviceCategoryRepository.save(cat3);

            ServiceCategory cat4 = new ServiceCategory();
            cat4.setName("Spa & Treatment");
            serviceCategoryRepository.save(cat4);
        }

        if (salonServiceRepository.count() == 0) {
            log.info("Creating initial salon services...");

            ServiceCategory haircutCat = serviceCategoryRepository.findByName("Haircut").orElse(null);
            ServiceCategory spaCat = serviceCategoryRepository.findByName("Spa & Treatment").orElse(null);
            ServiceCategory stylingCat = serviceCategoryRepository.findByName("Styling & Perm").orElse(null);
            ServiceCategory colorCat = serviceCategoryRepository.findByName("Coloring").orElse(null);

            SalonService service1 = new SalonService();
            service1.setName("Cắt tóc nam (Haircut)");
            service1.setDescription("Cắt tóc tạo kiểu thời trang, cạo mặt, vuốt sáp chuẩn men.");
            service1.setPrice(100000.0);
            service1.setDuration(30); // 30 minutes
            service1.setActive(true);
            service1.setCategory(haircutCat);
            service1.setImageUrl("https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800");
            salonServiceRepository.save(service1);

            SalonService service2 = new SalonService();
            service2.setName("Gội đầu massage (Shampoo & Massage)");
            service2.setDescription("Gội đầu thư giãn với thảo dược, massage cổ vai gáy giúp xua tan mệt mỏi.");
            service2.setPrice(150000.0);
            service2.setDuration(45);
            service2.setActive(true);
            service2.setCategory(spaCat);
            service2.setImageUrl("https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800");
            salonServiceRepository.save(service2);

            SalonService service3 = new SalonService();
            service3.setName("Uốn Hàn Quốc (Korean Perm)");
            service3.setDescription("Uốn phồng chân tóc, uốn sóng lơi nhẹ nhàng chuẩn phong cách Hàn Quốc.");
            service3.setPrice(500000.0);
            service3.setDuration(120); // 2 hours
            service3.setActive(true);
            service3.setCategory(stylingCat);
            service3.setImageUrl("https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800");
            salonServiceRepository.save(service3);

            SalonService service4 = new SalonService();
            service4.setName("Nhuộm màu thời trang (Coloring)");
            service4.setDescription("Nhuộm các màu khói, màu tẩy sáng da, cam kết thuốc xịn không khô tóc.");
            service4.setPrice(800000.0);
            service4.setDuration(150);
            service4.setActive(true);
            service4.setCategory(colorCat);
            service4.setImageUrl("https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800");
            salonServiceRepository.save(service4);

            log.info("Salon services initialized successfully.");
        } else {
            log.info("Services already exist. Skipping initialization.");
        }

        // 3. Initialize Bookings
        if (bookingRepository.count() == 0) {
            log.info("Creating initial bookings...");
            
            User customer1 = userRepository.findByEmail("khachhang1@example.com").orElse(null);
            User customer2 = userRepository.findByEmail("khachhang2@example.com").orElse(null);
            User stylist1 = userRepository.findByEmail("stylist1@example.com").orElse(null);
            User stylist2 = userRepository.findByEmail("stylist2@example.com").orElse(null);

            List<SalonService> allServices = salonServiceRepository.findAll();
            SalonService s1 = allServices.isEmpty() ? null : allServices.get(0);
            SalonService s2 = allServices.size() > 1 ? allServices.get(1) : null;

            if (customer1 != null && stylist1 != null && s1 != null) {
                // Booking 1: Customer created
                Booking b1 = new Booking();
                b1.setCustomer(customer1);
                b1.setStylist(stylist1);
                b1.setAppointmentDate(LocalDate.now().plusDays(1));
                b1.setStartTime(LocalTime.of(10, 0));
                b1.setEndTime(LocalTime.of(10, 30));
                b1.setStatus(BookingStatus.PENDING);
                b1.setPaymentStatus(PaymentStatus.UNPAID);
                b1.setTotalAmount(s1.getPrice());
                b1.setCreatedByStaff(false);
                b1.setNotes("Khách tự đặt");
                b1.setBookingCode("BK-1001");
                b1.setCustomerName(customer1.getFirstName() + " " + customer1.getLastName());
                b1.setCustomerPhone("0901234567");
                b1.setCreationType("Online");
                bookingRepository.save(b1);

                BookingService bs1 = new BookingService();
                bs1.setBooking(b1);
                bs1.setService(s1);
                bs1.setPriceAtBooking(s1.getPrice());
                bookingServiceRepository.save(bs1);

                // Booking 2: Staff created
                if (customer2 != null && stylist2 != null) {
                    Booking b2 = new Booking();
                    b2.setCustomer(customer2);
                    b2.setStylist(stylist2);
                    b2.setAppointmentDate(LocalDate.now());
                    b2.setStartTime(LocalTime.of(14, 0));
                    b2.setEndTime(LocalTime.of(15, 0));
                    b2.setStatus(BookingStatus.CONFIRMED);
                    b2.setPaymentStatus(PaymentStatus.UNPAID);
                    b2.setTotalAmount(s1.getPrice() + (s2 != null ? s2.getPrice() : 0));
                    b2.setCreatedByStaff(true);
                    b2.setNotes("Thu ngân đặt hộ (Walk-in)");
                    b2.setBookingCode("BK-1002");
                    b2.setCustomerName(customer2.getFirstName() + " " + customer2.getLastName());
                    b2.setCustomerPhone("0987654321");
                    b2.setCreationType("Walk-in");
                    bookingRepository.save(b2);

                    BookingService bs2_1 = new BookingService();
                    bs2_1.setBooking(b2);
                    bs2_1.setService(s1);
                    bs2_1.setPriceAtBooking(s1.getPrice());
                    bookingServiceRepository.save(bs2_1);

                    if (s2 != null) {
                        BookingService bs2_2 = new BookingService();
                        bs2_2.setBooking(b2);
                        bs2_2.setService(s2);
                        bs2_2.setPriceAtBooking(s2.getPrice());
                        bookingServiceRepository.save(bs2_2);
                    }
                }
                
                log.info("Bookings initialized successfully.");
            }
        } else {
            log.info("Bookings already exist. Skipping initialization.");
        }

        log.info("Mock data initialization completed.");
    }
}
