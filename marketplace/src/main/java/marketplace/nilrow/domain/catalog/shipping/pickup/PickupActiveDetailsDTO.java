package marketplace.nilrow.domain.catalog.shipping.pickup;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import marketplace.nilrow.domain.address.AddressDTO;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupActiveDetailsDTO {
    private boolean active;
    private Integer prazoRetirada;
    private BigDecimal precoRetirada;
    private AddressDTO address;
}