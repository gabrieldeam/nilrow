package marketplace.nilrow.domain.people;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
public class UpdateAcceptsSmsDTO {

    @NotNull(message = "O campo acceptsSms é obrigatório")
    private Boolean acceptsSms;

}
