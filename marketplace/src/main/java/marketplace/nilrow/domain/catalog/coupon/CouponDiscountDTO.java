package marketplace.nilrow.domain.catalog.coupon;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class CouponDiscountDTO {
    private boolean valid;
    private BigDecimal discountToApply;
    private String message;
}