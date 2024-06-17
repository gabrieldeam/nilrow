package marketplace.nilrow.domain.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import marketplace.nilrow.validation.ValidNickname;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterDTO {

    @NotBlank(message = "Nome de usuário é obrigatório")
    @Size(min = 4, max = 30, message = "O nome de usuário deve ter entre 4 e 30 caracteres")
    @Pattern(regexp = "^[a-z0-9._]+$", message = "O nome de usuário só pode conter letras minúsculas, números, pontos e sublinhados")
    @ValidNickname(
            forbiddenMessage = "O nome de usuário contém palavras proibidas",
            consecutiveCharsMessage = "O nome de usuário não pode conter caracteres consecutivos"
    )
    private String nickname;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, max = 20, message = "A senha deve ter entre 8 e 20 caracteres")
    @Pattern(regexp = ".*[A-Z].*", message = "A senha deve conter pelo menos uma letra maiúscula")
    @Pattern(regexp = ".*[a-z].*", message = "A senha deve conter pelo menos uma letra minúscula")
    @Pattern(regexp = ".*\\d.*", message = "A senha deve conter pelo menos um número")
    @Pattern(regexp = ".*[!@#$%^&*()].*", message = "A senha deve conter pelo menos um caractere especial")
    private String password;

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 1, max = 255, message = "O nome deve ter entre 1 e 255 caracteres")
    private String name;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "O e-mail deve ser válido")
    private String email;

    @NotBlank(message = "Telefone é obrigatório")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "O telefone deve conter apenas números e ter entre 10 e 15 dígitos")
    private String phone;

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "^[0-9]{11}$", message = "O CPF deve conter exatamente 11 dígitos")
    private String cpf;

    private LocalDate birthDate;

    private UserRole role;

    private boolean acceptsSms = false;
}
