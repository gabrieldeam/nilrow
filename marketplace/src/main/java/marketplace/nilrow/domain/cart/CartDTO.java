package marketplace.nilrow.domain.cart;


import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class CartDTO {
    private String cartId;
    private String userId;
    private List<CartItemDTO> items;
    private BigDecimal total;  // soma de (unitPrice ou discountPrice) * qty
}