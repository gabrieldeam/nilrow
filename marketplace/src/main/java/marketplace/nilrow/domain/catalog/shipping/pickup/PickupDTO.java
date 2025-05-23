package marketplace.nilrow.domain.catalog.shipping.pickup;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupDTO {
    private String id;
    private String catalogId;
    private boolean active;
    private Integer prazoRetirada;
    private BigDecimal precoRetirada;
}