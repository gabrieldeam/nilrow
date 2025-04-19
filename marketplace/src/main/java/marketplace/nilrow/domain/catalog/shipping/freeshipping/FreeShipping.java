package marketplace.nilrow.domain.catalog.shipping.freeshipping;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.Catalog;
import java.util.List;

@Entity
@Table(name = "free_shippings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class FreeShipping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @Column(nullable = false)
    private boolean active;

    @OneToMany(mappedBy = "freeShipping", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FreeShippingRadius> radii;
}