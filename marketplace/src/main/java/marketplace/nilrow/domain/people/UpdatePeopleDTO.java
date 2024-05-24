package marketplace.nilrow.domain.people;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdatePeopleDTO {

    @Size(min = 4, max = 30, message = "Nickname must be between 4 and 30 characters")
    @Pattern(regexp = "^[a-z0-9._]+$", message = "Nickname can only contain lowercase letters, numbers, dots, and underscores")
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
