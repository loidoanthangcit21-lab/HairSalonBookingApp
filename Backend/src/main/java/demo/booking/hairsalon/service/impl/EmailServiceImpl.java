package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.service.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @Override
    public void sendVerificationEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verify your email");
        message.setText(
                """
                Welcome to Hair Salon.
                                
                Your verification code is: %s
                                
                Please enter this code in the app to verify your account.
                """.formatted(token)
        );
        mailSender.send(message);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset your password");
        message.setText(
                """
                We received a request to reset your password.
    
                Your password reset code is: %s
    
                If you did not request this, please ignore this email.
                """.formatted(token)
        );
        mailSender.send(message);
    }

}