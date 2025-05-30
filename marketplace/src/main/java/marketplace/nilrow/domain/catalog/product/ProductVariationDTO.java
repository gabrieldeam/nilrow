package marketplace.nilrow.domain.catalog.product;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    private List<VariationImageDTO> images;

    @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres.")
    private String name;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @NotNull(message = "O preço é obrigatório.")
    @DecimalMin(value = "0.0", inclusive = false, message = "O preço deve ser maior que zero.")
    private BigDecimal price;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal discountPrice;

    @NotNull(message = "O estoque é obrigatório.")
    @Min(value = 0, message = "O estoque não pode ser negativo.")
    private Integer stock;

    private boolean active;
}