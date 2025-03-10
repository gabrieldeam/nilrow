package marketplace.nilrow.domain.catalog.product.template;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariationTemplateImageDTO {
    private String id;
    private String variationTemplateId;
    private String imageUrl;
    private Integer orderIndex;
}
