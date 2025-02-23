package marketplace.nilrow.domain.catalog.product.template;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.domain.catalog.product.Product;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product_templates")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class ProductTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Imagens do template
    @ElementCollection
    @CollectionTable(name = "product_template_images", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "image_url")
    private List<String> images;

    @Column(nullable = false)
    private String name;

    // Relacionamentos
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id", nullable = false)
    private SubCategory subCategory;

    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    // Informações básicas
    private BigDecimal netWeight;
    private BigDecimal grossWeight;
    private String unitOfMeasure;
    private Integer itemsPerBox;

    // Variações do template
    @OneToMany(mappedBy = "productTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductTemplateVariation> variations;

    // Produtos associados ao template (opcional, para visualização bidirecional)
    @OneToMany(mappedBy = "productTemplate")
    private List<Product> products;
}
