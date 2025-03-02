package marketplace.nilrow.domain.catalog.product;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product_variations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class ProductVariation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Produto ao qual a variação pertence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Atributos da variação (por exemplo, cor, tamanho)
    @OneToMany(mappedBy = "variation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariationAttribute> attributes;

    // Imagens do produto com ordem definida pelo usuário
    @ElementCollection
    @OrderColumn(name = "image_order")
    @CollectionTable(name = "product_variation_images", joinColumns = @JoinColumn(name = "variation_id"))
    @Column(name = "image_url")
    private List<String> images;

    // Preço específico da variação (se diferente do produto principal)
    private BigDecimal price;

    private BigDecimal discountPrice;

    // Estoque específico da variação
    private Integer stock;

    // Ativo (visualização)
    @Column(nullable = false)
    private boolean active;
}