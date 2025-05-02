package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreeShippingAvailabilityDTO {
    private boolean freeShippingAvailable;
    private BigDecimal missingAmount;
}