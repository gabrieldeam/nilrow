package marketplace.nilrow.domain.catalog.coupon;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class CouponRadiusDTO {
    private String id;
    private double radius;
    private List<CouponCoordinateDTO> coordinates;
}
