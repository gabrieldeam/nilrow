package marketplace.nilrow.domain.catalog.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariationDTO {

    private String id;
    private String productId;
    private List<VariationAttributeDTO> attributes;
    private BigDecimal price;
    private Integer stock;
    private boolean active;
}
