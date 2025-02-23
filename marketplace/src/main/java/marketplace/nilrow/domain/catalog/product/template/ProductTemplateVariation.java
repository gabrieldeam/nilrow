package marketplace.nilrow.domain.catalog.product.template;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "product_template_variations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class ProductTemplateVariation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String attributeName;

    // Lista de valores possíveis para este atributo
    @ElementCollection
    @CollectionTable(name = "product_template_variation_values", joinColumns = @JoinColumn(name = "variation_id"))
    @Column(name = "possible_value")
    private List<String> possibleValues;

    // Relação com o template
    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private ProductTemplate productTemplate;
}
