package marketplace.nilrow.domain.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordDTO {
    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    private String email;
}
