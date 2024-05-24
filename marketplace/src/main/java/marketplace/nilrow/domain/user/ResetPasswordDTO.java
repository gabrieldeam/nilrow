package marketplace.nilrow.domain.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordDTO {
    private String email;
    private String resetCode;
    private String newPassword;
}
