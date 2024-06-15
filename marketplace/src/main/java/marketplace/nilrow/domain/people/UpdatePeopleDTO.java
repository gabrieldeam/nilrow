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

    @Email(message = "O e-mail deve ser válido")
    private String email;

    @Size(min = 1, max = 255, message = "O nome deve ter entre 1 e 255 caracteres")
    private String name;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "O telefone deve conter apenas números e ter entre 10 e 15 dígitos")
    private String phone;

    @Pattern(regexp = "^[0-9]{11}$", message = "O CPF deve conter exatamente 11 dígitos")
    private String cpf;

    private LocalDate birthDate;
}
