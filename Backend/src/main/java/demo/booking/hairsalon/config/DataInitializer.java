package demo.booking.hairsalon.config;

import demo.booking.hairsalon.model.entity.*;
import demo.booking.hairsalon.model.enums.BookingStatus;
import demo.booking.hairsalon.model.enums.PaymentMethod;
import demo.booking.hairsalon.model.enums.PaymentStatus;
import demo.booking.hairsalon.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import demo.booking.hairsalon.model.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final ExpertRepository expertRepository;
    private final ExpertImageRepository expertImageRepository;
    private final ExpertCategoryRepository expertCategoryRepository;
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Initializing mock data for core database...");

        if (expertCategoryRepository.count() < 10 || serviceRepository.count() < 10 || expertRepository.count() < 6) {
            log.info("Resetting old dataset. Seeding 5 categories, 10 services, 6 experts with 2-3 categories per expert...");

            try {
                paymentRepository.deleteAll();
                invoiceRepository.deleteAll();
                bookingRepository.deleteAll();
                expertCategoryRepository.deleteAll();
                expertImageRepository.deleteAll();
                serviceRepository.deleteAll();
                expertRepository.deleteAll();
                categoryRepository.deleteAll();
            } catch (Exception e) {
                log.warn("Error clearing old tables during re-seed: {}", e.getMessage());
            }
        }

        // 1. Initialize Users (Customers & Admin)
        if (userRepository.findByEmail("admin@salon.com").isEmpty()) {
            log.info("Creating default Admin user...");

            User admin = User.builder()
                    .fullName("Salon Admin Manager")
                    .phone("15550000000")
                    .email("admin@salon.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("john.doe@example.com").isEmpty()) {
            User customer1 = User.builder()
                    .fullName("John Doe")
                    .phone("15551234567")
                    .email("john.doe@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.CUSTOMER)
                    .enabled(true)
                    .build();
            userRepository.save(customer1);

            User customer2 = User.builder()
                    .fullName("Jane Smith")
                    .phone("15559876543")
                    .email("jane.smith@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.CUSTOMER)
                    .enabled(true)
                    .build();
            userRepository.save(customer2);

            log.info("Users initialized.");
        }


        // 2. Initialize 5 Categories (in English)
        if (categoryRepository.count() == 0) {
            log.info("Creating 5 initial categories...");

            Category cat1 = Category.builder()
                    .name("Haircut")
                    .description("Professional hair trimming, precision fades, and modern styling")
                    .isActive(true)
                    .build();
            categoryRepository.save(cat1);

            Category cat2 = Category.builder()
                    .name("Styling & Perm")
                    .description("Trending hair styling, texturizing, blowout, and perm treatments")
                    .isActive(true)
                    .build();
            categoryRepository.save(cat2);

            Category cat3 = Category.builder()
                    .name("Coloring")
                    .description("Full hair coloring, fashion highlights, balayage, and touch-ups")
                    .isActive(true)
                    .build();
            categoryRepository.save(cat3);

            Category cat4 = Category.builder()
                    .name("Treatment & Care")
                    .description("Deep conditioning, scalp detox, keratin repair, and hair spa")
                    .isActive(true)
                    .build();
            categoryRepository.save(cat4);

            Category cat5 = Category.builder()
                    .name("Beard & Grooming")
                    .description("Royal beard trimming, hot towel shave, and facial grooming")
                    .isActive(true)
                    .build();
            categoryRepository.save(cat5);

            log.info("Categories initialized.");
        }

        // 3. Initialize 10 Services (in English, prices under $100 USD)
        if (serviceRepository.count() == 0) {
            log.info("Creating 10 initial services...");

            Category haircutCat = categoryRepository.findByName("Haircut").orElse(null);
            Category stylingCat = categoryRepository.findByName("Styling & Perm").orElse(null);
            Category coloringCat = categoryRepository.findByName("Coloring").orElse(null);
            Category careCat = categoryRepository.findByName("Treatment & Care").orElse(null);
            Category groomingCat = categoryRepository.findByName("Beard & Grooming").orElse(null);

            if (haircutCat != null) {
                serviceRepository.save(Service.builder()
                        .category(haircutCat)
                        .name("Classic Gentleman Haircut")
                        .description("Includes precision haircut, shampoo wash, scalp massage, and style finish")
                        .price(new BigDecimal("15000"))
                        .imageUrl("https://images.unsplash.com/photo-1599351431202-1e0f0137899a")
                        .isActive(true)
                        .build());

                serviceRepository.save(Service.builder()
                        .category(haircutCat)
                        .name("Modern Fade & Style")
                        .description("Skin fade or taper fade with textured top styling and edge-up")
                        .price(new BigDecimal("35.00"))
                        .imageUrl("https://images.unsplash.com/photo-1622286342621-4bd786c2447c")
                        .isActive(true)
                        .build());

                serviceRepository.save(Service.builder()
                        .category(haircutCat)
                        .name("Complete Luxury Grooming Package")
                        .description("Full haircut, beard trim, facial scrub, and premium head massage")
                        .price(new BigDecimal("99.00"))
                        .imageUrl("https://images.unsplash.com/photo-1503951914875-452162b0f3f1")
                        .isActive(true)
                        .build());
            }

            if (stylingCat != null) {
                serviceRepository.save(Service.builder()
                        .category(stylingCat)
                        .name("Premium Perm & Texture")
                        .description("Korean wave perm or curly perm for long-lasting natural volume")
                        .price(new BigDecimal("75.00"))
                        .imageUrl("https://images.unsplash.com/photo-1562322140-8baeececf3df")
                        .isActive(true)
                        .build());

                serviceRepository.save(Service.builder()
                        .category(stylingCat)
                        .name("Blowout & Volume Styling")
                        .description("Shampoo, condition, and blowout with pomade or wax texturizing finish")
                        .price(new BigDecimal("45.00"))
                        .imageUrl("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e")
                        .isActive(true)
                        .build());
            }

            if (coloringCat != null) {
                serviceRepository.save(Service.builder()
                        .category(coloringCat)
                        .name("Full Hair Coloring")
                        .description("Complete single-process hair dye with premium organic color formula")
                        .price(new BigDecimal("85.00"))
                        .imageUrl("https://images.unsplash.com/photo-1560066984-138dadb4c035")
                        .isActive(true)
                        .build());

                serviceRepository.save(Service.builder()
                        .category(coloringCat)
                        .name("Highlights & Touch-Up")
                        .description("Fashion highlights or root touch-up treatment for vibrant gloss")
                        .price(new BigDecimal("65.00"))
                        .imageUrl("https://images.unsplash.com/photo-1519699047748-de8e457a634e")
                        .isActive(true)
                        .build());
            }

            if (careCat != null) {
                serviceRepository.save(Service.builder()
                        .category(careCat)
                        .name("Keratin Smoothing Repair")
                        .description("Deep hair reconstruction, frizz control, and keratin shine treatment")
                        .price(new BigDecimal("95.00"))
                        .imageUrl("https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388")
                        .isActive(true)
                        .build());

                serviceRepository.save(Service.builder()
                        .category(careCat)
                        .name("Scalp Detox & Hair Spa")
                        .description("Exfoliating scalp treatment, steam therapy, and essential oil massage")
                        .price(new BigDecimal("50.00"))
                        .imageUrl("https://images.unsplash.com/photo-1540555700478-4be289fbecef")
                        .isActive(true)
                        .build());
            }

            if (groomingCat != null) {
                serviceRepository.save(Service.builder()
                        .category(groomingCat)
                        .name("Royal Beard Trim & Shave")
                        .description("Hot towel shave, beard sculpting, line-up, and hydrating beard oil")
                        .price(new BigDecimal("30.00"))
                        .imageUrl("https://images.unsplash.com/photo-1621605815971-fbc98d665033")
                        .isActive(true)
                        .build());
            }

            log.info("10 Services initialized.");
        }

        // 4. Initialize 6 Experts (all in English)
        if (expertRepository.count() == 0) {
            log.info("Creating 6 initial experts...");

            Category haircutCat = categoryRepository.findByName("Haircut").orElse(null);
            Category stylingCat = categoryRepository.findByName("Styling & Perm").orElse(null);
            Category coloringCat = categoryRepository.findByName("Coloring").orElse(null);
            Category careCat = categoryRepository.findByName("Treatment & Care").orElse(null);
            Category groomingCat = categoryRepository.findByName("Beard & Grooming").orElse(null);

            // Expert 1
            Expert expert1 = Expert.builder()
                    .fullName("Alexander Wright")
                    .phone("15551000001")
                    .description("Master Barber & Fade Specialist with 8 years of experience in classic & modern haircuts")
                    .experienceYears(8)
                    .avatarUrl("https://images.unsplash.com/photo-1599566150163-29194dcaad36")
                    .isActive(true)
                    .build();
            expertRepository.save(expert1);

            // Expert 2
            Expert expert2 = Expert.builder()
                    .fullName("Sophia Martinez")
                    .phone("15551000002")
                    .description("Senior Colorist & Perm Specialist certified in balayage and European coloring techniques")
                    .experienceYears(6)
                    .avatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2")
                    .isActive(true)
                    .build();
            expertRepository.save(expert2);

            // Expert 3
            Expert expert3 = Expert.builder()
                    .fullName("David Kim")
                    .phone("15551000003")
                    .description("Creative Director specializing in Asian hair textures, Korean wave perms, and trend cuts")
                    .experienceYears(7)
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d")
                    .isActive(true)
                    .build();
            expertRepository.save(expert3);

            // Expert 4
            Expert expert4 = Expert.builder()
                    .fullName("Emma Watson")
                    .phone("15551000004")
                    .description("Scalp Therapy & Hair Repair Specialist dedicated to Keratin and organic hair treatments")
                    .experienceYears(5)
                    .avatarUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956")
                    .isActive(true)
                    .build();
            expertRepository.save(expert4);

            // Expert 5
            Expert expert5 = Expert.builder()
                    .fullName("Marcus Vance")
                    .phone("15551000005")
                    .description("Master Groomer specializing in royal beard trims, precision straight razor shaves & facial care")
                    .experienceYears(9)
                    .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e")
                    .isActive(true)
                    .build();
            expertRepository.save(expert5);

            // Expert 6
            Expert expert6 = Expert.builder()
                    .fullName("Olivia Taylor")
                    .phone("15551000006")
                    .description("Top Stylist & Fashion Color Expert specializing in bridal styling and ombre highlights")
                    .experienceYears(10)
                    .avatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2")
                    .isActive(true)
                    .build();
            expertRepository.save(expert6);

            // Add Expert Categories mapping
            if (haircutCat != null) {
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert1.getId(), haircutCat.getId())).expert(expert1).category(haircutCat).build());
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert3.getId(), haircutCat.getId())).expert(expert3).category(haircutCat).build());
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert5.getId(), haircutCat.getId())).expert(expert5).category(haircutCat).build());
            }
            if (stylingCat != null) {
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert2.getId(), stylingCat.getId())).expert(expert2).category(stylingCat).build());
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert3.getId(), stylingCat.getId())).expert(expert3).category(stylingCat).build());
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert6.getId(), stylingCat.getId())).expert(expert6).category(stylingCat).build());
            }
            if (coloringCat != null) {
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert2.getId(), coloringCat.getId())).expert(expert2).category(coloringCat).build());
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert6.getId(), coloringCat.getId())).expert(expert6).category(coloringCat).build());
            }
            if (careCat != null) {
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert4.getId(), careCat.getId())).expert(expert4).category(careCat).build());
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert2.getId(), careCat.getId())).expert(expert2).category(careCat).build());
            }
            if (groomingCat != null) {
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert5.getId(), groomingCat.getId())).expert(expert5).category(groomingCat).build());
                expertCategoryRepository.save(ExpertCategory.builder().id(new ExpertCategoryId(expert1.getId(), groomingCat.getId())).expert(expert1).category(groomingCat).build());
            }

            log.info("6 Experts initialized.");

        }

        // 5. Initialize Sample Booking & Invoice
        if (bookingRepository.count() == 0) {
            log.info("Creating initial sample bookings...");

            List<User> users = userRepository.findAll();
            List<Service> services = serviceRepository.findAll();
            List<Expert> experts = expertRepository.findAll();

            if (!users.isEmpty() && !services.isEmpty() && !experts.isEmpty()) {
                User user = users.get(0);
                Service service = services.get(0);
                Expert expert = experts.get(0);

                LocalDateTime start = LocalDateTime.now().plusDays(1).withHour(9).withMinute(0);
                LocalDateTime end = start.plusHours(1);

                Booking booking = Booking.builder()
                        .user(user)
                        .services(java.util.List.of(service))
                        .expert(expert)
                        .startAt(start)
                        .endAt(end)
                        .status(BookingStatus.CONFIRMED)
                        .build();
                bookingRepository.save(booking);

                Invoice invoice = Invoice.builder()
                        .booking(booking)
                        .totalAmount(service.getPrice())
                        .build();
                invoiceRepository.save(invoice);

                Payment payment = Payment.builder()
                        .invoice(invoice)
                        .amount(service.getPrice())
                        .paymentMethod(PaymentMethod.CASH)
                        .status(PaymentStatus.SUCCESS)
                        .transactionCode("TXN-" + System.currentTimeMillis())
                        .paidAt(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);
            }
        }

        log.info("Mock data initialization completed successfully.");
    }
}
