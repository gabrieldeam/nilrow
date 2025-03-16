package marketplace.nilrow.domain.catalog.shipping.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDTO {
    private String id;
    private String catalogId;
    private boolean active;
    private List<DeliveryRadiusDTO> radii;
}