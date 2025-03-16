package marketplace.nilrow.domain.catalog.shipping.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRadiusDTO {
    private String id;
    private double radius;
    private BigDecimal price;
    private List<DeliveryCoordinateDTO> coordinates;
}