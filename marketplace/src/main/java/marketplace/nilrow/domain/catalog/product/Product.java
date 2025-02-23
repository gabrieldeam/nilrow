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

        // Imagens do produto
        @ElementCollection
        @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
        @Column(name = "image_url")
        private List<String> images;

        @Column(nullable = false)
        private String name;

        // Código SKU
        @Column(nullable = false, unique = true)
        private String skuCode;

        // Preço de venda
        @Column(nullable = false)
        private BigDecimal salePrice;

        // Preço com desconto
        private BigDecimal discountPrice;

        // Unidade de medida
        @Column(nullable = false)
        private String unitOfMeasure;

        // Tipo de produto (Produto ou Serviço)
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private ProductType type;

        // Condição do produto (Novo, Usado ou Recondicionado)
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private ProductCondition condition;

        // Categoria
        @ManyToOne
        @JoinColumn(name = "category_id", nullable = false)
        private Category category;

        // Subcategoria
        @ManyToOne
        @JoinColumn(name = "subcategory_id", nullable = false)
        private SubCategory subCategory;

        // Marca
        @ManyToOne
        @JoinColumn(name = "brand_id", nullable = false)
        private Brand brand;

        // Tipo de produção (Própria ou de terceiros)
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private ProductionType productionType;

        // Data de validade
        private LocalDate expirationDate;

        // Frete grátis
        @Column(nullable = false)
        private boolean freeShipping;

        // Peso líquido
        private BigDecimal netWeight;

        // Peso bruto
        private BigDecimal grossWeight;

        // Dimensões
        private BigDecimal width;
        private BigDecimal height;
        private BigDecimal depth;

        // Volumes
        private Integer volumes;

        // Itens por caixa
        private Integer itemsPerBox;

        // GTIN/EAN
        private String gtinEan;

        // GTIN/EAN tributário
        private String gtinEanTax;

        // Descrição curta
        @Column(length = 255)
        private String shortDescription;

        // Descrição complementar
        @Column(length = 2000)
        private String complementaryDescription;

        // Observações
        @Column(length = 2000)
        private String notes;

        // Estoque
        private Integer stock;

        // Ativo (visualização)
        @Column(nullable = false)
        private boolean active;

        // Variações do produto
        @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<ProductVariation> variations;

        // Reference to the Catalog
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "catalog_id", nullable = false)
        private Catalog catalog;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "template_id")
        private ProductTemplate productTemplate;
    }