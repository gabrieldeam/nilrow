package marketplace.nilrow.domain.catalog.shipping.delivery;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPriceDTO {
    private BigDecimal price;
    private int averageDeliveryTime;
}
