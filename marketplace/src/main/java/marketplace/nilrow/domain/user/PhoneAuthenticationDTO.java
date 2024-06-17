package marketplace.nilrow.domain.user;

import jakarta.validation.constraints.NotBlank;

public record PhoneAuthenticationDTO(
        @NotBlank String phone,
        @NotBlank String password,
        String location,
        String device
) {}
