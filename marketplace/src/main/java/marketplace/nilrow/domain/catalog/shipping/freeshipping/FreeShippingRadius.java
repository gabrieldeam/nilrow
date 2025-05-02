package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "free_shipping_radii")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class FreeShippingRadius {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "free_shipping_id", nullable = false)
    private FreeShipping freeShipping;

    @Column(nullable = false)
    private double radius;                          // km

    @Column(nullable = false)
    private BigDecimal minCartValue;                // valor a partir do qual o frete zera

    @OneToMany(mappedBy = "freeShippingRadius", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FreeShippingCoordinate> coordinates;
}