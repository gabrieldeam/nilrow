package marketplace.nilrow.domain.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import marketplace.nilrow.validation.ValidNickname;

@Getter
@Setter
public class UpdateNicknameDTO {

    @NotBlank(message = "Nome de usuário é obrigatório")
    @Size(min = 4, max = 30, message = "O nome de usuário deve ter entre 4 e 30 caracteres")
    @Pattern(regexp = "^[a-z0-9._]+$", message = "O nome de usuário só pode conter letras minúsculas, números, pontos e sublinhados")
    @ValidNickname(
            forbiddenMessage = "O nome de usuário contém palavras proibidas",
            consecutiveCharsMessage = "O nome de usuário não pode conter caracteres consecutivos"
    )
    private String newNickname;
}
