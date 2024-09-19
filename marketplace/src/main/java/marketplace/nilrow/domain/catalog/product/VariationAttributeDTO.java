package marketplace.nilrow.domain.catalog.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariationAttributeDTO {

    private String id;
    private String variationId;
    private String attributeName;
    private String attributeValue;
}
