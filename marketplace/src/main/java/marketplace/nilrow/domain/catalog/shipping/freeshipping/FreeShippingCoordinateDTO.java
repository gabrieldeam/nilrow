package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreeShippingCoordinateDTO {
    private String id;
    private double latitude;
    private double longitude;
}