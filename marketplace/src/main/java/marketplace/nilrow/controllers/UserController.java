package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import marketplace.nilrow.domain.user.UpdateNicknameDTO;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.infra.exception.DuplicateFieldException;
import marketplace.nilrow.infra.security.TokenService;
import marketplace.nilrow.repositories.UserRepository;
import marketplace.nilrow.util.CookieUtil;
import marketplace.nilrow.util.ForbiddenWordsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Tag(name = "User", description = "Operações relacionadas ao usuário")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

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
    public ResponseEntity<?> updateNickname(@RequestBody UpdateNicknameDTO updateNicknameDTO, HttpServletResponse response) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = (User) userRepository.findByNickname(userDetails.getUsername());

            String newNickname = updateNicknameDTO.getNewNickname();

            // Se o novo nickname for null ou vazio, retorna 200 OK e mantém o nickname atual
            if (newNickname == null || newNickname.trim().isEmpty()) {
                return ResponseEntity.ok().build();
            }

            // Validação do novo nickname
            if (newNickname.length() < 4 || newNickname.length() > 30) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("O nome de usuário deve ter entre 4 e 30 caracteres");
            }

            if (!newNickname.matches("^[a-z0-9._]+$")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("O nome de usuário só pode conter letras minúsculas, números, pontos e sublinhados");
            }

            // Verificar palavras proibidas
            if (ForbiddenWordsUtil.containsForbiddenWord(newNickname)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("O nome de usuário contém palavras proibidas");
            }

            // Verificar caracteres consecutivos
            if (newNickname.contains("....") || newNickname.contains("____")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("O nome de usuário não pode conter caracteres consecutivos");
            }

            // Verifica se o novo nickname já existe
            if (userRepository.findByNickname(newNickname) != null) {
                throw new DuplicateFieldException("Nickname", "Nome de usuário já existe");
            }

            user.setNickname(newNickname);
            userRepository.save(user);

            // Gerar novo token
            String newToken = tokenService.generateToken(user);

            // Adicionar o novo token no cookie
            CookieUtil.addAuthCookie(response, newToken);

            return ResponseEntity.ok().build();
        } catch (DuplicateFieldException e) {
            logger.error("Update nickname failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Update nickname failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUser(HttpServletResponse response) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = (User) userRepository.findByNickname(userDetails.getUsername());

            userRepository.delete(user);

            // Remover o cookie de autenticação
            CookieUtil.removeAuthCookie(response);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Failed to delete user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
