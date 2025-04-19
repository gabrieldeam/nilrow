package marketplace.nilrow.domain.catalog.coupon;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.util.GeoCoordinate;

@Entity
@Table(name = "coupon_coordinates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class CouponCoordinate implements GeoCoordinate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "coupon_radius_id")
    private CouponRadius couponRadius;

    private double latitude;
    private double longitude;
}
