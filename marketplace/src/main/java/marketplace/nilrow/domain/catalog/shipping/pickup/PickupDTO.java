package marketplace.nilrow.domain.catalog.shipping.pickup;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryRadiusDTO;

import java.math.BigDecimal;
import java.util.List;

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