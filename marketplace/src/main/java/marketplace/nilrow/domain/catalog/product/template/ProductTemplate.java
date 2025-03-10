package marketplace.nilrow.domain.catalog.product.template;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductType;
import marketplace.nilrow.domain.catalog.product.ProductVariation;
import marketplace.nilrow.domain.catalog.product.TechnicalSpecification;
import marketplace.nilrow.domain.catalog.product.brand.Brand;

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType type;

    // Informações básicas
    private BigDecimal netWeight;
    private BigDecimal grossWeight;
    private BigDecimal width;
    private BigDecimal height;
    private BigDecimal depth;
    private Integer volumes;
    private Integer itemsPerBox;

    @Column(length = 255)
    private String shortDescription;

    @Column(length = 2000)
    private String complementaryDescription;

    @Column(length = 2000)
    private String notes;

    @OneToMany(mappedBy = "productTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TechnicalSpecificationTemplate> technicalSpecifications;

    @OneToMany(mappedBy = "productTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductTemplateVariation> variations;

    // Produtos associados ao template (opcional, para visualização bidirecional)
    @OneToMany(mappedBy = "productTemplate")
    private List<Product> products;
}
