package marketplace.nilrow.domain.catalog.shipping.delivery;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "delivery_radii")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class DeliveryRadius {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @Column(nullable = false)
    private double radius; // Raio em km

    @Column(nullable = false)
    private BigDecimal price; // Valor do delivery para esse raio

    @OneToMany(mappedBy = "deliveryRadius", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeliveryCoordinate> coordinates;
}