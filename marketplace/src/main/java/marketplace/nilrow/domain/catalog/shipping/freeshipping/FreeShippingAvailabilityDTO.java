package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreeShippingAvailabilityDTO {
    private boolean freeShippingAvailable;
    private int averageDeliveryTime;
}