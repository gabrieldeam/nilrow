package marketplace.nilrow.domain.catalog.product;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private String id;

    private List<String> images;

    @NotBlank(message = "O nome é obrigatório.")
    @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres.")
    private String name;

    private String skuCode;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @NotNull(message = "O preço de venda é obrigatório.")
    @DecimalMin(value = "0.0", inclusive = false, message = "O preço de venda deve ser maior que zero.")
    private BigDecimal salePrice;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal discountPrice;

    @NotBlank(message = "A unidade de medida é obrigatória.")
    private String unitOfMeasure;

    @NotNull(message = "O tipo de produto é obrigatório.")
    private ProductType type;

    @NotNull(message = "A condição do produto é obrigatória.")
    private ProductCondition condition;

    @NotBlank(message = "A categoria é obrigatória.")
    private String categoryId;

    @NotBlank(message = "A subcategoria é obrigatória.")
    private String subCategoryId;

    @NotBlank(message = "A marca é obrigatória.")
    private String brandId;

    @NotNull(message = "O tipo de produção é obrigatório.")
    private ProductionType productionType;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expirationDate;

    private boolean freeShipping;

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

    private String gtinEan;
    private String gtinEanTax;

    @Size(max = 255, message = "A descrição curta deve ter no máximo 255 caracteres.")
    private String shortDescription;

    @Size(max = 2000, message = "A descrição complementar deve ter no máximo 2000 caracteres.")
    private String complementaryDescription;

    @Size(max = 2000, message = "As notas devem ter no máximo 2000 caracteres.")
    private String notes;

    @NotNull(message = "O Estoque é obrigatório.")
    private Integer stock;

    private boolean active;

    @NotBlank(message = "O catálogo é obrigatório.")
    private String catalogId;

    private String productTemplateId;

    // Relação com as especificações técnicas
    private List<TechnicalSpecificationDTO> technicalSpecifications;

    // Relação com as variações do produto
    private List<ProductVariationDTO> variations;
}