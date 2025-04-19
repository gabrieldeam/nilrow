package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.util.GeoCoordinate;

@Entity
@Table(name = "free_shipping_coordinates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class FreeShippingCoordinate implements GeoCoordinate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "free_shipping_radius_id", nullable = false)
    private FreeShippingRadius freeShippingRadius;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;
}