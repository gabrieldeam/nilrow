package marketplace.nilrow.domain.catalog.shipping.delivery;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.util.GeoCoordinate;

@Entity
@Table(name = "delivery_coordinates")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class DeliveryCoordinate implements GeoCoordinate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "delivery_radius_id", nullable = false)
    private DeliveryRadius deliveryRadius;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;
}