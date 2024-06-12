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
        String logoUrl = "http://localhost:8080/api/images/nilrow.svg";  // Substitua pelo caminho correto
        String emailValidationImageUrl = "http://localhost:8080/api/images/EmailValidation.png";  // Substitua pelo caminho correto
        String infoIconUrl = "http://localhost:8080/api/images/informacoes.svg"; // Supondo que a imagem esteja na mesma pasta

        return "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: 'Roboto', sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; }" +
                ".email-container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; border-radius: 10px; }" +
                ".header { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }" +
                ".header img { width: 143px; height: 29px; }" +
                ".email-body { text-align: center; padding: 0 40px; }" +
                ".email-body h1 { font-size: 28px; font-weight: 900; color: #ffffff; margin-bottom: 10px; line-height: 1.2; text-align: left; }" +
                ".email-body p { font-size: 16px; font-weight: 400; color: #ffffff; margin-bottom: 20px; text-align: left; }" +
                ".email-body img.mascot { display: block; margin: 0 auto 20px; width: 367.67px; height: 313px; }" +
                ".email-button { display: block; width: 100%; height: 40px; margin: 20px 0; font-size: 15px; color: #ffffff !important; background-color: #7B33E5; border: none; border-radius: 5px; text-decoration: none; font-weight: 500; cursor: pointer; text-align: center; line-height: 40px; }" +
                ".email-button:hover, .email-button:active, .email-button:focus { text-decoration: none !important; }" +
                ".custom-button { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 13px; border: none; border-radius: 100px; color: #ffffff; cursor: pointer; font-size: 16px; background-color: #212121; transition: border 0.3s ease; text-decoration: none; margin: 20px auto; }" +
                ".custom-button span { margin-top: 12px; }" +
                ".button-icon { width: 20px; height: 20px; margin-right: 8px; margin-top: 14px; }" +
                ".custom-button:hover, .custom-button:active, .custom-button:focus { border: 1px solid #FFFFFF; outline: none; }" +
                ".custom-button.active { border: 1px solid #FFFFFF; }" +
                ".footer { background-color: #ffffff; color: #000000; padding: 20px; text-align: center; margin-top: 20px; border-radius: 0 0 10px 10px; }" +
                ".footer p { margin: 5px 0; font-size: 12px; }" +
                ".footer .info-section { margin-top: 10px; }" +
                "@media (max-width: 768px) { .custom-button span { display: none; } .button-icon.with-text { margin-right: 0px; } .email-body { padding: 0 20px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"email-container\">" +
                "<div class=\"header\">" +
                "<img src=\"" + logoUrl + "\" alt=\"Nilrow Logo\">" +
                "</div>" +
                "<div class=\"email-body\">" +
                "<img src=\"" + emailValidationImageUrl + "\" class=\"mascot\" alt=\"Email Validation\">" +
                "<h1>Verifique seu endereço de e-mail</h1>" +
                "<p>Para completar seu perfil e começar a usar a Nilrow ao máximo, você precisará verificar seu endereço de e-mail.</p>" +
                "<a href=\"" + validationLink + "\" class=\"email-button\" style=\"color: #ffffff !important; background-color: #7B33E5; text-decoration: none;\">Confirmar email</a>" +
                "<a href=\"https://www.google.com/\" class=\"custom-button\" style=\"color: #ffffff; text-decoration: none;\">" +
                "<img src=\"" + infoIconUrl + "\" class=\"button-icon\" alt=\"Informações\" style=\"width: 20px; height: 20px;\">" +
                "<span>Feedback e ajuda</span>" +
                "</a>" +
                "</div>" +
                "<div class=\"footer\">" +
                "<div class=\"info-section\">" +
                "<p>NILROW LTDA<br>CNPJ 30.066.869 / 0001-08</p>" +
                "<p>Nosso endereço é: AVENIDA NOSSA SENHORA DA PENHA, 2796 EDIF IMPACTO EMPRESARIAL - SANTA LUIZA - VITÓRIA-ES</p>" +
                "<p>© Nilrow 2024</p>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }


    public String createResetPasswordBody(String resetCode) {
        String logoUrl = "http://localhost:8080/api/images/nilrow.svg";
        String mascotImageUrl = "http://localhost:8080/api/images/EmailCode.png"; // Supondo que a imagem esteja na mesma pasta
        String infoIconUrl = "http://localhost:8080/api/images/informacoes.svg"; // Supondo que a imagem esteja na mesma pasta

        // Gerar HTML para o código de redefinição de senha com estilo
        StringBuilder resetCodeHtml = new StringBuilder();
        for (char digit : resetCode.toCharArray()) {
            resetCodeHtml.append("<span class=\"reset-code-digit\">").append(digit).append("</span>");
        }

        return "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: 'Roboto', sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; }" +
                ".email-container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; border-radius: 10px; }" +
                ".header { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }" +
                ".header img { width: 143px; height: 29px; }" +
                ".email-body { text-align: center; padding: 0 40px; }" +
                ".email-body h1 { font-size: 28px; font-weight: 900; color: #ffffff; margin-bottom: 10px; line-height: 1.2; text-align: left; }" +
                ".email-body p { font-size: 16px; font-weight: 400; color: #ffffff; margin-bottom: 20px; text-align: left; }" +
                ".email-body img.mascot { display: block; margin: 0 auto 20px; width: 367.67px; height: 313px; }" +
                ".reset-code-container { display: flex; justify-content: center; }" +
                ".reset-code { display: inline-flex; justify-content: center; }" +
                ".reset-code-digit { background: #ffffff; border: 1px solid #ddd; padding: 8px 20px; margin-right: 5px; font-size: 22px; border-radius: 5px; color: #000000; text-align: center; }" +
                ".reset-code-digit:last-child { margin-right: 0; }" +
                ".copy-button { display: inline-block; font-size: 15px; color: #7B33E5; background-color: transparent; border: none; border-radius: 5px; text-decoration: none; font-weight: 500; cursor: pointer; text-align: center; margin-top: 10px; }" +
                ".copy-button:hover, .copy-button:active, .copy-button:focus { text-decoration: underline; }" +
                ".custom-button { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 13px; border: none; border-radius: 100px; color: #ffffff; cursor: pointer; font-size: 16px; background-color: #212121; transition: border 0.3s ease; text-decoration: none; margin: 20px auto; }" +
                ".custom-button span { margin-top: 12px; }" +
                ".button-icon { width: 20px; height: 20px; margin-right: 8px; margin-top: 14px; }" +
                ".custom-button:hover, .custom-button:active, .custom-button:focus { border: 1px solid #FFFFFF; outline: none; }" +
                ".custom-button.active { border: 1px solid #FFFFFF; }" +
                ".footer { background-color: #ffffff; color: #000000; padding: 20px; text-align: center; margin-top: 20px; border-radius: 0 0 10px 10px; }" +
                ".footer p { margin: 5px 0; font-size: 12px; }" +
                ".footer .info-section { margin-top: 10px; }" +
                "@media (max-width: 768px) { .custom-button span { display: none; } .button-icon.with-text { margin-right: 0px; } .email-body { padding: 0 20px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"email-container\">" +
                "<div class=\"header\">" +
                "<img src=\"" + logoUrl + "\" alt=\"Nilrow Logo\">" +
                "</div>" +
                "<div class=\"email-body\">" +
                "<img src=\"" + mascotImageUrl + "\" class=\"mascot\" alt=\"Mascot\">" +
                "<h1>Olhe seu código de redefinição de senha!</h1>" +
                "<p>Para redefinir sua senha, por favor, insira o código de verificação abaixo no campo apropriado em nosso site.</p>" +
                "<div class=\"reset-code-container\"><div class=\"reset-code\">" + resetCodeHtml.toString() + "</div></div>" +
                "<p>Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.</p>" +
                "<a href=\"https://www.google.com/\" class=\"custom-button\" style=\"color: #ffffff; text-decoration: none;\">" +
                "<img src=\"" + infoIconUrl + "\" class=\"button-icon\" alt=\"Informações\" style=\"width: 20px; height: 20px;\">" +
                "<span>Feedback e ajuda</span>" +
                "</a>" +
                "</div>" +
                "<div class=\"footer\">" +
                "<div class=\"info-section\">" +
                "<p>NILROW LTDA<br>CNPJ 30.066.869 / 0001-08</p>" +
                "<p>Nosso endereço é: AVENIDA NOSSA SENHORA DA PENHA, 2796 EDIF IMPACTO EMPRESARIAL - SANTA LUIZA - VITÓRIA-ES</p>" +
                "<p>© Nilrow 2024</p>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }


}
