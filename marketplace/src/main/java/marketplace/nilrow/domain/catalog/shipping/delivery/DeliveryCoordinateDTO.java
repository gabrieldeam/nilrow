package marketplace.nilrow.domain.catalog.shipping.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryCoordinateDTO {
    private String id;
    private double latitude;
    private double longitude;
}