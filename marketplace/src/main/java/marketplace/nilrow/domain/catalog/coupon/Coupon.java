package marketplace.nilrow.domain.catalog.coupon;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.Product;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @ManyToOne(optional = false)
    @JoinColumn(name = "catalog_id")
    private Catalog catalog;

    @Column(nullable = false)
    private boolean active;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DiscountType discountType;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal discountValue;

    @Column(nullable = false)
    private int perUserLimit;     // nº de usos por pessoa

    @Column(nullable = false)
    private int totalLimit;       // nº total de usos

    @Column(nullable = false)
    private int totalUsed = 0;    // controle simples

    private LocalDateTime startsAt;
    private LocalDateTime endsAt;

    /* ===== escopo do cupom ===== */

    @ManyToMany
    @JoinTable(name = "coupon_categories",
            joinColumns = @JoinColumn(name = "coupon_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    private Set<Category> categories;

    @ManyToMany
    @JoinTable(name = "coupon_subcategories",
            joinColumns = @JoinColumn(name = "coupon_id"),
            inverseJoinColumns = @JoinColumn(name = "subcategory_id"))
    private Set<SubCategory> subCategories;

    @ManyToMany
    @JoinTable(name = "coupon_products",
            joinColumns = @JoinColumn(name = "coupon_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    private Set<Product> products;

    /* ===== geolocalização ===== */

    @OneToMany(mappedBy = "coupon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CouponRadius> radii;
}
