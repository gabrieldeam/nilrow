package marketplace.nilrow.domain.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordDTO {

    @NotBlank(message = "E-mail é obrigatório")
    private String email;

    @NotBlank(message = "Código é obrigatório")
    private String resetCode;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, max = 20, message = "A senha deve ter entre 8 e 20 caracteres")
    @Pattern(regexp = ".*[A-Z].*", message = "A senha deve conter pelo menos uma letra maiúscula")
    @Pattern(regexp = ".*[a-z].*", message = "A senha deve conter pelo menos uma letra minúscula")
    @Pattern(regexp = ".*\\d.*", message = "A senha deve conter pelo menos um número")
    @Pattern(regexp = ".*[!@#$%^&*()].*", message = "A senha deve conter pelo menos um caractere especial")
    private String newPassword;
}
