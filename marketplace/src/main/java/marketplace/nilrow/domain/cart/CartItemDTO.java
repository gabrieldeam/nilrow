package marketplace.nilrow.domain.cart;


import lombok.*;
import marketplace.nilrow.domain.catalog.product.VariationAttributeDTO;
import marketplace.nilrow.domain.channel.SimpleChannelDTO;

import java.math.BigDecimal;
import java.util.List;

/* Item detalhado no retorno do carrinho */
@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemDTO {
    private String id;
    private String productId;
    private String variationId;
    private String name;
    private String imageUrl;
    private BigDecimal unitPrice;
    private BigDecimal discountPrice;
    private Integer quantity;
    private List<VariationAttributeDTO> attributes;
    private SimpleChannelDTO channel;
    private String catalogId;
}