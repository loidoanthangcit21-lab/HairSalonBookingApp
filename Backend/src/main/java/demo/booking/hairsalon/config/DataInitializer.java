package demo.booking.hairsalon.config;

import demo.booking.hairsalon.model.entity.SalonService;
import demo.booking.hairsalon.model.entity.StylistProfile;
import demo.booking.hairsalon.model.entity.User;
import demo.booking.hairsalon.model.enums.Role;
import demo.booking.hairsalon.repository.SalonServiceRepository;
import demo.booking.hairsalon.repository.StylistProfileRepository;
import demo.booking.hairsalon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StylistProfileRepository stylistProfileRepository;
    private final SalonServiceRepository salonServiceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Initializing mock data...");

        // 1. Initialize Users (Receptionist & Stylists)
        if (userRepository.count() == 0) {
            log.info("Creating initial users...");

            // Create Receptionist
            User receptionist = new User();
            receptionist.setFirstName("Le");
            receptionist.setLastName("Tan");
            receptionist.setEmail("receptionist@example.com");
            receptionist.setPassword(passwordEncoder.encode("password123"));
            receptionist.setRole(Role.RECEPTIONIST);
            receptionist.setEnabled(true);
            userRepository.save(receptionist);

            // Create Stylist 1
            User stylist1 = new User();
            stylist1.setFirstName("Kha");
            stylist1.setLastName("Banh");
            stylist1.setEmail("stylist1@example.com");
            stylist1.setPassword(passwordEncoder.encode("password123"));
            stylist1.setRole(Role.STYLIST);
            stylist1.setEnabled(true);
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
            userRepository.save(customer);

            customer = new User();
            customer.setFirstName("User");
            customer.setLastName("2");
            customer.setEmail("khachhang2@example.com");
            customer.setPassword(passwordEncoder.encode("password123"));
            customer.setRole(Role.CUSTOMER);
            customer.setEnabled(true);
            userRepository.save(customer);

            log.info("Users and Profiles initialized successfully.");
        } else {
            log.info("Users already exist. Skipping initialization.");
        }

        // 2. Initialize Salon Services
        if (salonServiceRepository.count() == 0) {
            log.info("Creating initial salon services...");

            SalonService service1 = new SalonService();
            service1.setName("Cắt tóc nam (Haircut)");
            service1.setDescription("Cắt tóc tạo kiểu thời trang, cạo mặt, vuốt sáp chuẩn men.");
            service1.setPrice(100000.0);
            service1.setDuration(30); // 30 minutes
            service1.setActive(true);
            salonServiceRepository.save(service1);

            SalonService service2 = new SalonService();
            service2.setName("Gội đầu massage (Shampoo & Massage)");
            service2.setDescription("Gội đầu thư giãn với thảo dược, massage cổ vai gáy giúp xua tan mệt mỏi.");
            service2.setPrice(150000.0);
            service2.setDuration(45);
            service2.setActive(true);
            salonServiceRepository.save(service2);

            SalonService service3 = new SalonService();
            service3.setName("Uốn Hàn Quốc (Korean Perm)");
            service3.setDescription("Uốn phồng chân tóc, uốn sóng lơi nhẹ nhàng chuẩn phong cách Hàn Quốc.");
            service3.setPrice(500000.0);
            service3.setDuration(120); // 2 hours
            service3.setActive(true);
            salonServiceRepository.save(service3);

            SalonService service4 = new SalonService();
            service4.setName("Nhuộm màu thời trang (Coloring)");
            service4.setDescription("Nhuộm các màu khói, màu tẩy sáng da, cam kết thuốc xịn không khô tóc.");
            service4.setPrice(800000.0);
            service4.setDuration(150);
            service4.setActive(true);
            salonServiceRepository.save(service4);

            log.info("Salon services initialized successfully.");
        } else {
            log.info("Services already exist. Skipping initialization.");
        }

        log.info("Mock data initialization completed.");
    }
}
