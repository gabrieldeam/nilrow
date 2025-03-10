package marketplace.nilrow.domain.catalog.product.template;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalSpecificationTemplateDTO {

    private String id;

    @NotBlank(message = "O título é obrigatório.")
    @Size(max = 255, message = "O título deve ter no máximo 255 caracteres.")
    private String title;

    @NotBlank(message = "O conteúdo é obrigatório.")
    private String content;
}