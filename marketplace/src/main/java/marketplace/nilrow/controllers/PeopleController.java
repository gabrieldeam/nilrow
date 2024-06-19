package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.people.PeopleDTO;
import marketplace.nilrow.domain.people.UpdateAcceptsSmsDTO;
import marketplace.nilrow.domain.people.UpdatePeopleDTO;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.infra.exception.DuplicateFieldException;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.UserRepository;
import marketplace.nilrow.infra.security.TokenService;
import marketplace.nilrow.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/people")
@Tag(name = "Profile", description = "Operações relacionadas aos dados pessoais dos usuários")
public class PeopleController {

    @Autowired
    private PeopleRepository peopleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    @Value("${app.base.url}")
    private String baseUrl;

    @GetMapping
    public ResponseEntity<PeopleDTO> getPeople() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        People people = peopleRepository.findByUser(user);
        return ResponseEntity.ok(new PeopleDTO(people));
    }

    @PutMapping
    public ResponseEntity<?> updatePeople(@RequestBody UpdatePeopleDTO updatePeopleDTO) throws MessagingException {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        People people = peopleRepository.findByUser(user);

        boolean emailChanged = false;

        if (updatePeopleDTO.getEmail() != null && !updatePeopleDTO.getEmail().equals(people.getEmail())) {
            if (peopleRepository.findByEmail(updatePeopleDTO.getEmail()) != null) {
                throw new DuplicateFieldException("Email", "E-mail já existe");
            }
            people.setEmail(updatePeopleDTO.getEmail());
            people.setEmailValidated(false);
            emailChanged = true;
        }

        if (updatePeopleDTO.getPhone() != null) {
            people.setPhone(updatePeopleDTO.getPhone());
        }

        if (updatePeopleDTO.getName() != null) {
            people.setName(updatePeopleDTO.getName());
        }

        if (updatePeopleDTO.getCpf() != null && !updatePeopleDTO.getCpf().equals(people.getCpf())) {
            if (peopleRepository.findByCpf(updatePeopleDTO.getCpf()) != null) {
                throw new DuplicateFieldException("CPF", "CPF já existe");
            }
            people.setCpf(updatePeopleDTO.getCpf());
        }

        if (updatePeopleDTO.getBirthDate() != null) {
            people.setBirthDate(updatePeopleDTO.getBirthDate());
        }

        if (emailChanged) {
            String token = UUID.randomUUID().toString();
            people.setValidationToken(token);
            String validationLink = baseUrl + "/auth/validate-email?token=" + token;
            String emailBody = emailService.createEmailValidationBody(validationLink);

            emailService.sendHtmlEmail(people.getEmail(), "Validação de E-mail", emailBody);
        }

        peopleRepository.save(people);

        // Retornar a entidade atualizada
        return ResponseEntity.ok(new PeopleDTO(people));
    }

    @GetMapping("/accepts-sms")
    public ResponseEntity<Boolean> getAcceptsSms() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        People people = peopleRepository.findByUser(user);
        return ResponseEntity.ok(people.isAcceptsSms());
    }

    @PutMapping("/accepts-sms")
    public ResponseEntity<Void> updateAcceptsSms(@RequestBody @Valid UpdateAcceptsSmsDTO updateAcceptsSmsDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        People people = peopleRepository.findByUser(user);
        people.setAcceptsSms(updateAcceptsSmsDTO.getAcceptsSms());
        peopleRepository.save(people);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/email-validated")
    public ResponseEntity<Boolean> getEmailValidated() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        People people = peopleRepository.findByUser(user);
        return ResponseEntity.ok(people.isEmailValidated());
    }
}
