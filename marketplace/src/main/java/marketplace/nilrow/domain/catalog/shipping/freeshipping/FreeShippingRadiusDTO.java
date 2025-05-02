package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreeShippingRadiusDTO {
    private String id;
    private double radius;
    private BigDecimal minCartValue;
    private List<FreeShippingCoordinateDTO> coordinates;
}