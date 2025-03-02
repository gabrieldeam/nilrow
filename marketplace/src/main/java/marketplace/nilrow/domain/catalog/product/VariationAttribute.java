package marketplace.nilrow.domain.catalog.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variation_attributes")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class VariationAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Variação à qual o atributo pertence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variation_id", nullable = false)
    private ProductVariation variation;

    // Nome do atributo (por exemplo, "Cor")
    @Column(nullable = false)
    private String attributeName;

    // Valor do atributo (por exemplo, "Azul")
    @Column(nullable = false)
    private String attributeValue;
}