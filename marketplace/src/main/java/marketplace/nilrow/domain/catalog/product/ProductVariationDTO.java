package marketplace.nilrow.domain.catalog.product;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariationDTO {

    private String id;

    // Lista de atributos que descrevem a variação (ex.: cor, tamanho)
    private List<VariationAttributeDTO> attributes;

    @NotEmpty(message = "Deve ser informado pelo menos uma imagem.")
    private List<@NotBlank(message = "A URL da imagem não pode ser vazia.") String> images;

    @NotNull(message = "O preço é obrigatório.")
    @DecimalMin(value = "0.0", inclusive = false, message = "O preço deve ser maior que zero.")
    private BigDecimal price;

    private BigDecimal discountPrice;

    @NotNull(message = "O estoque é obrigatório.")
    @Min(value = 0, message = "O estoque não pode ser negativo.")
    private Integer stock;

    private boolean active;
}