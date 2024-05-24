package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.user.LoginResponseDTO;
import marketplace.nilrow.domain.user.UpdateNicknameDTO;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.infra.exception.DuplicateFieldException;
import marketplace.nilrow.infra.security.TokenService;
import marketplace.nilrow.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Tag(name = "User", description = "Operações relacionadas ao usuário")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @GetMapping("/nickname")
    public ResponseEntity<String> getNickname() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());
        return ResponseEntity.ok(user.getNickname());
    }

    @PutMapping("/nickname")
    public ResponseEntity<?> updateNickname(@RequestBody UpdateNicknameDTO updateNicknameDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userRepository.findByNickname(userDetails.getUsername());

        // Verifica se o novo nickname já existe
        if (userRepository.findByNickname(updateNicknameDTO.getNewNickname()) != null) {
            throw new DuplicateFieldException("Nickname", "Nickname already exists");
        }

        user.setNickname(updateNicknameDTO.getNewNickname());
        userRepository.save(user);

        // Gerar novo token
        String newToken = tokenService.generateToken(user);

        // Retornar o novo token ao usuário
        return ResponseEntity.ok(new LoginResponseDTO(newToken));
    }
}
