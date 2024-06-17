package marketplace.nilrow.domain.user;

import jakarta.validation.constraints.NotBlank;

public record AuthenticationDTO (

        @NotBlank String login,
        @NotBlank String password,
        String location,
        String device
) {
}
