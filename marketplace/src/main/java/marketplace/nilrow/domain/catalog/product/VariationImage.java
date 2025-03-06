package marketplace.nilrow.domain.catalog.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variation_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class VariationImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Associação: muitas imagens podem pertencer a uma variação
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variation_id", nullable = false)
    private ProductVariation variation;

    // URL do arquivo/imagem (ex.: "/uploads/xyz.png")
    @Column(nullable = false)
    private String imageUrl;

    // Opcional: ordem/index para organizar as imagens
    private Integer orderIndex;
}
