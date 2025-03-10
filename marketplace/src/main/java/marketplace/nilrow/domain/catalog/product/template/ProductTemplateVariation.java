package marketplace.nilrow.domain.catalog.product.template;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.VariationAttribute;
import marketplace.nilrow.domain.catalog.product.VariationImage;

import java.math.BigDecimal;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_template_id", nullable = false)
    private ProductTemplate productTemplate;

    @OneToMany(mappedBy = "variationTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariationTemplateAttribute> attributes;

    @OneToMany(mappedBy = "variationTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariationTemplateImage> variation;

    @OneToMany(mappedBy = "variationTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariationTemplateImage> images;


    private String name;
}
