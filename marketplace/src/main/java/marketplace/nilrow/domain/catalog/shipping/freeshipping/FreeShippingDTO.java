package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreeShippingDTO {
    private String id;
    private String catalogId;
    private boolean active;
    private List<FreeShippingRadiusDTO> radii;
}