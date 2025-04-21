package marketplace.nilrow.domain.cart;

import lombok.*;

/* Requisição para adicionar OU atualizar um item */
@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemRequest {

    private String productId;         // obrigatório se variationId não for enviado
    private String variationId;       // opcional
    private Integer quantity;         // > 0
}