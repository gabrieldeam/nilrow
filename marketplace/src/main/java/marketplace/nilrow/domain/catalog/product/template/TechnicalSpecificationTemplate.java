package marketplace.nilrow.domain.catalog.product.template;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.product.Product;

@Entity
@Table(name = "technical_specifications_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class TechnicalSpecificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_template_id", nullable = false)
    private ProductTemplate productTemplate;
}
