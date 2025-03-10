package marketplace.nilrow.domain.catalog.product.template;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import marketplace.nilrow.domain.catalog.product.ProductType;
import marketplace.nilrow.domain.catalog.product.ProductVariationDTO;
import marketplace.nilrow.domain.catalog.product.TechnicalSpecificationDTO;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductTemplateDTO {
    private String id;
    private List<String> images;
    private String name;
    private String categoryId;
    private String subCategoryId;
    private String brandId;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal netWeight;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal grossWeight;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal width;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal height;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal depth;

    private Integer volumes;
    private Integer itemsPerBox;
    private List<String> productsId;

    @NotNull(message = "O tipo de produto é obrigatório.")
    private ProductType type;

    @Size(max = 255, message = "A descrição curta deve ter no máximo 255 caracteres.")
    private String shortDescription;

    @Size(max = 2000, message = "A descrição complementar deve ter no máximo 2000 caracteres.")
    private String complementaryDescription;

    @Size(max = 2000, message = "As notas devem ter no máximo 2000 caracteres.")
    private String notes;

    private List<TechnicalSpecificationTemplateDTO> technicalSpecifications;
    private List<ProductTemplateVariationDTO> variations;
}
