package marketplace.nilrow.domain.catalog.product;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariationImageDTO {
    private String id;
    private String variationId; // ID da variação a que pertence
    private String imageUrl;
    private Integer orderIndex;
}
