package marketplace.nilrow.domain.catalog.coupon;

import lombok.*;
import marketplace.nilrow.domain.cart.CartItemDTO;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class CouponCheckRequest {
    private String catalogId;
    private String code;
    private List<CartItemDTO> items;
    private double lat;
    private double lon;
}