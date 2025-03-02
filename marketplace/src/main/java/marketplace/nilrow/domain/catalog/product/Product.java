package marketplace.nilrow.domain.catalog.product;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Product {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        private String id;

        // Imagens do produto com ordem definida pelo usuário
        @ElementCollection
        @OrderColumn(name = "image_order")
        @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
        @Column(name = "image_url")
        private List<String> images;

        @Column(nullable = false)
        private String name;

        @Column(nullable = false, unique = true)
        private String skuCode;

        @Column(nullable = false)
        private BigDecimal salePrice;

        private BigDecimal discountPrice;

        @Column(nullable = false)
        private String unitOfMeasure;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private ProductType type;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private ProductCondition condition;

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
        private ProductionType productionType;

        private LocalDate expirationDate;

        @Column(nullable = false)
        private boolean freeShipping;

        private BigDecimal netWeight;
        private BigDecimal grossWeight;
        private BigDecimal width;
        private BigDecimal height;
        private BigDecimal depth;
        private Integer volumes;
        private Integer itemsPerBox;
        private String gtinEan;
        private String gtinEanTax;

        @Column(length = 255)
        private String shortDescription;

        @Column(length = 2000)
        private String complementaryDescription;

        @Column(length = 2000)
        private String notes;

        private Integer stock;

        @Column(nullable = false)
        private boolean active;

        // Associação com as especificações técnicas
        @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<TechnicalSpecification> technicalSpecifications;

        // Variações do produto
        @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<ProductVariation> variations;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "catalog_id", nullable = false)
        private Catalog catalog;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "template_id")
        private ProductTemplate productTemplate;

}
