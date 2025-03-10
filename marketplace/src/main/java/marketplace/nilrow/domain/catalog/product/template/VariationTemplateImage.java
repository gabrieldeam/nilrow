package marketplace.nilrow.domain.catalog.product.template;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.product.ProductVariation;

@Entity
@Table(name = "variation_template_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class VariationTemplateImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Associação: muitas imagens podem pertencer a uma variação
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variation_template_id", nullable = false)
    private ProductTemplateVariation variationTemplate;

    // URL do arquivo/imagem (ex.: "/uploads/xyz.png")
    @Column(nullable = false)
    private String imageUrl;

    // Opcional: ordem/index para organizar as imagens
    private Integer orderIndex;
}
