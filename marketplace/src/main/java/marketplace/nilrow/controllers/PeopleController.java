package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.people.PeopleDTO;
import marketplace.nilrow.domain.people.UpdatePeopleDTO;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.infra.exception.DuplicateFieldException;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.UserRepository;
import marketplace.nilrow.infra.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/people")
@Tag(name = "People", description = "Operações relacionadas aos dados pessoais dos usuários")
public class PeopleController {

    @Autowired
    private PeopleRepository peopleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @GetMapping
    public ResponseEntity<PeopleDTO> getPeople() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        People people = peopleRepository.findByUser(user);
        return ResponseEntity.ok(new PeopleDTO(people));
    }

    @PutMapping
    public ResponseEntity<?> updatePeople(@RequestBody UpdatePeopleDTO updatePeopleDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        People people = peopleRepository.findByUser(user);

        if (updatePeopleDTO.getEmail() != null && !updatePeopleDTO.getEmail().equals(people.getEmail())) {
            if (peopleRepository.findByEmail(updatePeopleDTO.getEmail()) != null) {
                throw new DuplicateFieldException("Email", "Email already exists");
            }
            people.setEmail(updatePeopleDTO.getEmail());
        }

        if (updatePeopleDTO.getPhone() != null && !updatePeopleDTO.getPhone().equals(people.getPhone())) {
            if (peopleRepository.findByPhone(updatePeopleDTO.getPhone()) != null) {
                throw new DuplicateFieldException("Phone", "Phone already exists");
            }
            people.setPhone(updatePeopleDTO.getPhone());
        }

        if (updatePeopleDTO.getName() != null) {
            people.setName(updatePeopleDTO.getName());
        }

        if (updatePeopleDTO.getCpf() != null && !updatePeopleDTO.getCpf().equals(people.getCpf())) {
            if (peopleRepository.findByCpf(updatePeopleDTO.getCpf()) != null) {
                throw new DuplicateFieldException("CPF", "CPF already exists");
            }
            people.setCpf(updatePeopleDTO.getCpf());
        }

        if (updatePeopleDTO.getBirthDate() != null) {
            people.setBirthDate(updatePeopleDTO.getBirthDate());
        }

        peopleRepository.save(people);

        // Retornar a entidade atualizada
        return ResponseEntity.ok(new PeopleDTO(people));
    }
}
