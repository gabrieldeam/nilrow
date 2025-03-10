package marketplace.nilrow.domain.catalog.product.template;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.product.ProductVariation;

@Entity
@Table(name = "variation_template_attributes")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class VariationTemplateAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Variação à qual o atributo pertence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variation_template_id", nullable = false)
    private ProductTemplateVariation variationTemplate;

    // Nome do atributo (por exemplo, "Cor")
    @Column(nullable = false)
    private String attributeName;

    // Valor do atributo (por exemplo, "Azul")
    @Column(nullable = false)
    private String attributeValue;
}