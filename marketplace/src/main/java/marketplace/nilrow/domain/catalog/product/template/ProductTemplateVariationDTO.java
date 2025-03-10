package marketplace.nilrow.domain.catalog.product.template;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import marketplace.nilrow.domain.catalog.product.VariationAttributeDTO;
import marketplace.nilrow.domain.catalog.product.VariationImageDTO;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductTemplateVariationDTO {

    private String id;

    // Lista de atributos que descrevem a variação (ex.: cor, tamanho)
    private List<VariationTemplateAttributeDTO> attributes;

    private List<VariationTemplateImageDTO> images;

    @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres.")
    private String name;


}