package marketplace.nilrow.domain.catalog.shipping.delivery;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.Catalog;

import java.util.List;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @Column(nullable = false)
    private boolean active;

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeliveryRadius> radii;
}
