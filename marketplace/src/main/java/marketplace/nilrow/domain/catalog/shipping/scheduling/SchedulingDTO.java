package marketplace.nilrow.domain.catalog.shipping.scheduling;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO básico para criar/atualizar um Scheduling.
 * A lista de intervals será gerenciada separadamente
 * (via SchedulingInterval).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchedulingDTO {
    private String id;
    private String catalogId;
    private boolean active;
    private ShippingMode shippingMode;
}
