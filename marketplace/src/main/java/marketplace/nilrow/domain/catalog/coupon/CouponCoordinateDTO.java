package marketplace.nilrow.domain.catalog.coupon;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CouponCoordinateDTO {
    private String id;
    private double latitude;
    private double longitude;
}
