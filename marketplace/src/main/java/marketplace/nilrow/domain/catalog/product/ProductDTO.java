package marketplace.nilrow.domain.catalog.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private String id;
    private String catalogId;
    private List<String> images;
    private String name;
    private String skuCode;
    private BigDecimal salePrice;
    private BigDecimal discountPrice;
    private String unitOfMeasure;
    private ProductType type;
    private ProductCondition condition;
    private String categoryId;
    private String subCategoryId;
    private String brandId;
    private ProductionType productionType;
    private LocalDate expirationDate;
    private boolean freeShipping;
    private BigDecimal netWeight;
    private BigDecimal grossWeight;
    private BigDecimal width;
    private BigDecimal height;
    private BigDecimal depth;
    private Integer volumes;
    private Integer itemsPerBox;
    private String gtinEan;
    private String gtinEanTax;
    private String shortDescription;
    private String complementaryDescription;
    private String notes;
    private Integer stock;
    private boolean active;
    private List<String> associatedIds;
}