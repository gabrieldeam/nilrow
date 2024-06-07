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

    @NotBlank(message = "Nickname is mandatory")
    @Size(min = 4, max = 30, message = "Nickname must be between 4 and 30 characters")
    @Pattern(regexp = "^[a-z0-9._]+$", message = "Nickname can only contain lowercase letters, numbers, dots, and underscores")
    @ValidNickname
    private String newNickname;
}
