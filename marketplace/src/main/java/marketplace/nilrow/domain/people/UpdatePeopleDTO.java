package marketplace.nilrow.domain.people;

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
public class UpdatePeopleDTO {

    @NotBlank(message = "Nome de usuário é obrigatório")
    @Size(min = 4, max = 30, message = "O nome de usuário deve ter entre 4 e 30 caracteres")
    @Pattern(regexp = "^[a-z0-9._]+$", message = "O nome de usuário só pode conter letras minúsculas, números, pontos e sublinhados")
    @ValidNickname(
            forbiddenMessage = "O nome de usuário contém palavras proibidas",
            consecutiveCharsMessage = "O nome de usuário não pode conter caracteres consecutivos"
    )
    private String newNickname;

    @Email(message = "Email should be valid")
    private String email;

    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone should contain only numbers and be between 10 and 15 digits")
    private String phone;

    @Pattern(regexp = "^[0-9]{11}$", message = "CPF should contain exactly 11 digits")
    private String cpf;

    private LocalDate birthDate;
}
