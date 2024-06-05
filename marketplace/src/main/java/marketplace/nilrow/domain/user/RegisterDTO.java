package marketplace.nilrow.domain.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterDTO {

    @NotBlank(message = "Nickname is mandatory")
    @Size(min = 4, max = 30, message = "Nickname must be between 4 and 30 characters")
    @Pattern(regexp = "^[a-z0-9._]+$", message = "Nickname can only contain lowercase letters, numbers, dots, and underscores")
    private String nickname;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters long")
    @Pattern(regexp = ".*[A-Z].*", message = "Password must contain at least one uppercase letter")
    @Pattern(regexp = ".*[a-z].*", message = "Password must contain at least one lowercase letter")
    @Pattern(regexp = ".*\\d.*", message = "Password must contain at least one number")
    @Pattern(regexp = ".*[!@#$%^&*()].*", message = "Password must contain at least one special character")
    private String password;

    @NotBlank(message = "Name is mandatory")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone is mandatory")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone should contain only numbers and be between 10 and 15 digits")
    private String phone;

    @NotBlank(message = "CPF is mandatory")
    @Pattern(regexp = "^[0-9]{11}$", message = "CPF should contain exactly 11 digits")
    private String cpf;

    private LocalDate birthDate;

    private UserRole role;
}
