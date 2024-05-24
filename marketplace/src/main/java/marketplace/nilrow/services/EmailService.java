package marketplace.nilrow.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true indicates HTML

        mailSender.send(mimeMessage);
    }

    public String createEmailValidationBody(String validationLink) {
        return "<html>" +
                "<body>" +
                "<p>Por favor, clique no link abaixo para validar seu e-mail:</p>" +
                "<a href=\"" + validationLink + "\">Validar E-mail</a>" +
                "</body>" +
                "</html>";
    }

    public String createResetPasswordBody(String resetCode) {
        return "<html>" +
                "<body>" +
                "<p>Seu código de redefinição de senha é:</p>" +
                "<h2>" + resetCode + "</h2>" +
                "</body>" +
                "</html>";
    }
}
