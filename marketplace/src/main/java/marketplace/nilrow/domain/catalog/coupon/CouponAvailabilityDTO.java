package marketplace.nilrow.domain.catalog.coupon;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class CouponAvailabilityDTO {
    private boolean valid;
    private BigDecimal discountToApply;   // 0 se inválido
}
