package marketplace.nilrow.domain.catalog.coupon;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data @NoArgsConstructor @AllArgsConstructor
public class CouponDTO {
    private String id;
    private String code;
    private String catalogId;
    private boolean active;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private int perUserLimit;
    private int totalLimit;
    private int totalUsed;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;

    private Set<String> categoryIds;
    private Set<String> subCategoryIds;
    private Set<String> productIds;

    private List<CouponRadiusDTO> radii;
}
