package marketplace.nilrow.domain.catalog.coupon;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "coupon_radii")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class CouponRadius {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(nullable = false)
    private double radius; // km – só para referência / ordenação

    @OneToMany(mappedBy = "couponRadius", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CouponCoordinate> coordinates;
}
