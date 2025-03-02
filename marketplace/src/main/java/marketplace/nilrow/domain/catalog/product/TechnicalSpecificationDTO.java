package marketplace.nilrow.domain.catalog.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalSpecificationDTO {

    private String id;

    @NotBlank(message = "O título é obrigatório.")
    @Size(max = 255, message = "O título deve ter no máximo 255 caracteres.")
    private String title;

    @NotBlank(message = "O conteúdo é obrigatório.")
    private String content;
}