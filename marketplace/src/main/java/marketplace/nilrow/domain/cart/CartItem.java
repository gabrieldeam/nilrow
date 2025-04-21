package marketplace.nilrow.domain.cart;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"cart_id", "product_id", "variation_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /* relacionamento com o carrinho */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    /* referência ao produto; sempre preenchido */
    @Column(name = "product_id", nullable = false)
    private String productId;

    /**
     * Caso o cliente escolha uma variação específica,
     * este campo armazena o ID dessa variação.
     * Caso contrário, permanece `null`.
     */
    @Column(name = "variation_id")
    private String variationId;

    @Column(nullable = false)
    private Integer quantity;
}
