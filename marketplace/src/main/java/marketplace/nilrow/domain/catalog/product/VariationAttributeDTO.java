package marketplace.nilrow.domain.catalog.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariationAttributeDTO {

    private String id;

    @NotBlank(message = "O nome do atributo é obrigatório.")
    @Size(max = 255, message = "O nome do atributo deve ter no máximo 255 caracteres.")
    private String attributeName;

    @NotBlank(message = "O valor do atributo é obrigatório.")
    @Size(max = 255, message = "O valor do atributo deve ter no máximo 255 caracteres.")
    private String attributeValue;
}