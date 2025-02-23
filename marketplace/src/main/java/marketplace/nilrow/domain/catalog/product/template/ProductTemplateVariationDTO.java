package marketplace.nilrow.domain.catalog.product.template;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductTemplateVariationDTO {
    private String id;
    private String attributeName;
    private List<String> possibleValues;
}
