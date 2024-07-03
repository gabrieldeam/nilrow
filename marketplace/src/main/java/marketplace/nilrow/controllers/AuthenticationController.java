package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.*;
import marketplace.nilrow.infra.exception.DuplicateFieldException;
import marketplace.nilrow.infra.security.TokenService;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.UserRepository;
import marketplace.nilrow.services.EmailService;
import marketplace.nilrow.util.CookieUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth", description = "Endpoints públicos relacionados à autenticação e registro")
public class AuthenticationController {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository repository;

    @Autowired
    private PeopleRepository peopleRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    @Value("${app.base.url}")
    private String baseUrl;

    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody @Valid AuthenticationDTO data, HttpServletResponse response) {
        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);

            var token = tokenService.generateToken((User) auth.getPrincipal());

            CookieUtil.addAuthCookie(response, token);

            // Enviar email com informações de login se location e device estiverem presentes de forma assíncrona
            if (data.location() != null && data.device() != null) {
                User user = (User) auth.getPrincipal();
                People people = peopleRepository.findByUser(user);
                emailService.sendLoginNotificationEmail(people.getEmail(), data.location(), data.device());
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Login failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/login-phone")
    public ResponseEntity<Void> loginWithPhone(@RequestBody @Valid PhoneAuthenticationDTO data, HttpServletResponse response) {
        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.phone(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);

            var token = tokenService.generateToken((User) auth.getPrincipal());

            CookieUtil.addAuthCookie(response, token);

            // Enviar email com informações de login se location e device estiverem presentes de forma assíncrona
            if (data.location() != null && data.device() != null) {
                User user = (User) auth.getPrincipal();
                People people = peopleRepository.findByUser(user);
                emailService.sendLoginNotificationEmail(people.getEmail(), data.location(), data.device());
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Login with phone failed", e);
            throw new UsernameNotFoundException("Invalid phone number or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterDTO data) {
        try {
            if (this.repository.findByNickname(data.getNickname()) != null) {
                throw new DuplicateFieldException("Nickname", "Nome de usuário já em uso");
            }
            if (this.peopleRepository.findByEmail(data.getEmail()) != null) {
                throw new DuplicateFieldException("Email", "Email já em uso");
            }
            if (this.peopleRepository.findByCpf(data.getCpf()) != null) {
                throw new DuplicateFieldException("CPF", "CPF já em uso");
            }

            String encryptedPassword = new BCryptPasswordEncoder().encode(data.getPassword());
            UserRole role = data.getRole() != null ? data.getRole() : UserRole.USER;
            User newUser = new User(data.getNickname(), encryptedPassword, role);

            this.repository.save(newUser);

            String token = UUID.randomUUID().toString();
            People newPeople = new People(data.getName(), data.getEmail(), data.getPhone(),
                    data.getCpf(), data.getBirthDate(), newUser);
            newPeople.setValidationToken(token);
            newPeople.setAcceptsSms(data.isAcceptsSms()); // Set the acceptsSms field

            this.peopleRepository.save(newPeople);

            // Enviar e-mail de validação
            String validationLink = baseUrl + "/auth/validate-email?token=" + token;
            String emailBody = emailService.createEmailValidationBody(validationLink);

            emailService.sendHtmlEmail(data.getEmail(), "Validação de E-mail", emailBody);

            return ResponseEntity.ok().build();
        } catch (DuplicateFieldException e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Registration failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }


    @GetMapping("/validate-email")
    public ResponseEntity<Void> validateEmail(@RequestParam("token") String token) {
        People people = peopleRepository.findByValidationToken(token);
        if (people != null) {
            people.setEmailValidated(true);
            peopleRepository.save(people);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendBaseUrl + "/email-validated-success")
                    .build();
        } else {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendBaseUrl + "/email-validation-failed")
                    .build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordDTO data) {
        People people = peopleRepository.findByEmail(data.getEmail());
        if (people == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found");
        }

        String resetCode = String.format("%06d", new Random().nextInt(999999));
        people.setResetPasswordCode(resetCode);
        this.peopleRepository.save(people);

        String emailBody = emailService.createResetPasswordBody(resetCode);

        try {
            emailService.sendHtmlEmail(data.getEmail(), "Redefinição de Senha", emailBody);
            return ResponseEntity.ok("Código de redefinição enviado para o email.");
        } catch (Exception e) {
            logger.error("Error sending reset password email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao enviar o e-mail de redefinição de senha.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO data) {
        People people = peopleRepository.findByEmail(data.getEmail());
        if (people == null || !people.getResetPasswordCode().equals(data.getResetCode())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid email or reset code.");
        }

        User user = people.getUser();
        String encryptedPassword = new BCryptPasswordEncoder().encode(data.getNewPassword());
        user.setPassword(encryptedPassword);
        this.repository.save(user);

        // Limpar o código de redefinição após a senha ser redefinida
        people.setResetPasswordCode(null);
        peopleRepository.save(people);

        return ResponseEntity.ok("Senha redefinida com sucesso.");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            CookieUtil.removeAuthCookie(response);
            String token = tokenService.extractTokenFromRequest(request);
            if (token != null) {
                tokenService.addToBlacklist(token);
            }
            return ResponseEntity.ok("Desconectado com sucesso");
        } catch (Exception e) {
            logger.error("Logout failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Void> checkAuthentication(HttpServletRequest request) {
        String token = tokenService.extractTokenFromRequest(request);
        if (token == null || tokenService.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }
}
