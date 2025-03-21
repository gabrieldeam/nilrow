package marketplace.nilrow.domain.catalog.shipping.pickup;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.Catalog;

import java.math.BigDecimal;


@Entity
@Table(name = "pickup")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Pickup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private Integer prazoRetirada;

    @Column(nullable = false)
    private BigDecimal precoRetirada;

}