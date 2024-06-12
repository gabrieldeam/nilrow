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
        String logoUrl = "http://localhost:3000/path/to/nilrow.svg";  // Substitua pelo caminho correto
        String emailValidationImageUrl = "http://localhost:3000/path/to/EmailValidation.png";  // Substitua pelo caminho correto

        return "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: 'Roboto', sans-serif; }" +
                ".email-container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }" +
                ".header { display: flex; align-items: center; }" +
                ".header img { width: 143px; height: 29px; }" +
                ".email-body { text-align: left; }" +
                ".email-body h1 { font-size: 35px; font-weight: 900; }" +
                ".email-body p { font-size: 16px; font-weight: 400; }" +
                ".email-body img { display: block; margin: 0 auto 20px; width: 367.67px; height: 313px; }" +
                ".email-button { display: block; width: fit-content; margin: 20px auto; padding: 15px 25px; font-size: 15px; color: #fff; background-color: #7B33E5; border: none; border-radius: 5px; text-decoration: none; }" +
                ".custom-button { display: flex; align-items: center; justify-content: center; height: 44px; padding: 0 13px; border: none; border-radius: 100px; color: #ffffff; cursor: pointer; font-size: 16px; background-color: #212121; transition: border 0.3s ease; }" +
                ".button-icon { width: 20px; height: 20px; }" +
                ".button-icon.with-text { margin-right: 8px; }" +
                ".custom-button:hover, .custom-button:active, .custom-button:focus { border: 1px solid #FFFFFF; outline: none; }" +
                ".custom-button.active { border: 1px solid #FFFFFF; }" +
                "@media (max-width: 768px) { .custom-button span { display: none; } .button-icon.with-text { margin-right: 0px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"email-container\">" +
                "<div class=\"header\">" +
                "<img src=\"" + logoUrl + "\" alt=\"Nilrow Logo\">" +
                "</div>" +
                "<div class=\"email-body\">" +
                "<img src=\"" + emailValidationImageUrl + "\" alt=\"Email Validation\">" +
                "<h1>Verifique seu endereço de e-mail</h1>" +
                "<p>Para completar seu perfil e começar a usar a Nilrow ao máximo, você precisará verificar seu endereço de e-mail.</p>" +
                "<a href=\"" + validationLink + "\" class=\"email-button\">Confirmar email</a>" +
                "<button class=\"custom-button\"><span class=\"button-icon with-text\"></span>Botão Personalizado</button>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    public String createResetPasswordBody(String resetCode) {
        String logoUrl = "http://localhost:3000/path/to/nilrow.svg";  // Substitua pelo caminho correto
        String emailValidationImageUrl = "http://localhost:3000/path/to/EmailValidation.png";  // Substitua pelo caminho correto

        // Gerar HTML para o código de redefinição de senha com estilo
        StringBuilder resetCodeHtml = new StringBuilder();
        for (char digit : resetCode.toCharArray()) {
            resetCodeHtml.append("<span class=\"reset-code-digit\">").append(digit).append("</span>");
        }

        return "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: 'Roboto', sans-serif; }" +
                ".email-container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }" +
                ".header { display: flex; align-items: center; }" +
                ".header img { width: 143px; height: 29px; }" +
                ".email-body { text-align: left; }" +
                ".email-body h1 { font-size: 35px; font-weight: 900; }" +
                ".email-body p { font-size: 16px; font-weight: 400; }" +
                ".email-body img { display: block; margin: 0 auto 20px; width: 367.67px; height: 313px; }" +
                ".reset-code { display: flex; justify-content: left; margin: 20px 0; }" +
                ".reset-code-digit { background: #ffffff; border: 1px solid #ddd; padding: 10px; margin-right: 5px; font-size: 20px; border-radius: 5px; }" +
                ".copy-button { display: block; width: fit-content; margin: 20px 0; padding: 15px 25px; font-size: 15px; color: #fff; background-color: #7B33E5; border: none; border-radius: 5px; text-decoration: none; font-weight: 500; }" +
                ".custom-button { display: flex; align-items: center; justify-content: center; height: 44px; padding: 0 13px; border: none; border-radius: 100px; color: #ffffff; cursor: pointer; font-size: 16px; background-color: #212121; transition: border 0.3s ease; }" +
                ".button-icon { width: 20px; height: 20px; }" +
                ".button-icon.with-text { margin-right: 8px; }" +
                ".custom-button:hover, .custom-button:active, .custom-button:focus { border: 1px solid #FFFFFF; outline: none; }" +
                ".custom-button.active { border: 1px solid #FFFFFF; }" +
                "@media (max-width: 768px) { .custom-button span { display: none; } .button-icon.with-text { margin-right: 0px; } }" +
                "</style>" +
                "<script>" +
                "function copyToClipboard() {" +
                "    const el = document.createElement('textarea');" +
                "    el.value = '" + resetCode + "';" +
                "    document.body.appendChild(el);" +
                "    el.select();" +
                "    document.execCommand('copy');" +
                "    document.body.removeChild(el);" +
                "    alert('Código copiado para a área de transferência');" +
                "}" +
                "</script>" +
                "</head>" +
                "<body>" +
                "<div class=\"email-container\">" +
                "<div class=\"header\">" +
                "<img src=\"" + logoUrl + "\" alt=\"Nilrow Logo\">" +
                "</div>" +
                "<div class=\"email-body\">" +
                "<img src=\"" + emailValidationImageUrl + "\" alt=\"Email Validation\">" +
                "<h1>Olhe seu código de redefinição de senha</h1>" +
                "<p>Para redefinir sua senha, por favor, insira o código de verificação abaixo no campo apropriado em nosso site.</p>" +
                "<div class=\"reset-code\">" + resetCodeHtml.toString() + "</div>" +
                "<button class=\"copy-button\" onclick=\"copyToClipboard()\">Copiar</button>" +
                "<p>Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.</p>" +
                "<button class=\"custom-button\"><span class=\"button-icon with-text\"></span>Botão Personalizado</button>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
