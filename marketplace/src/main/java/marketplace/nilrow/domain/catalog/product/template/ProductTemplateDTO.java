package marketplace.nilrow.domain.catalog.product.template;

import lombok.*;

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
    private BigDecimal netWeight;
    private BigDecimal grossWeight;
    private String unitOfMeasure;
    private Integer itemsPerBox;
    private List<String> associatedTemplateIds;
    private List<String> productsId;
}
