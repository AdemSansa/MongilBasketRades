package com.mongilbasket.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Thin wrapper around JavaMailSender. MAIL_USERNAME/MAIL_PASSWORD are optional env vars
 * (see application.yml) -- if unset, sends are skipped with a warning rather than blocking
 * whatever admin action triggered them (e.g. coach account creation).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final boolean configured;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.configured = fromAddress != null && !fromAddress.isBlank();
    }

    public void send(String to, String subject, String body) {
        if (!configured) {
            log.warn("MAIL_USERNAME/MAIL_PASSWORD not configured -- skipping email to {} (subject: {})", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
