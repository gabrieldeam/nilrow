package marketplace.nilrow.domain.catalog.location;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.Catalog;

import java.util.List;

@Entity
@Table(name = "locations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    // Mantém a lista [latitude, longitude] se quiser
    @ElementCollection
    @CollectionTable(name = "location_positions", joinColumns = @JoinColumn(name = "location_id"))
    @Column(name = "position")
    private List<Double> position;

    // Em vez de included/excluded separadas, agora é só:
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Polygon> polygons;

    private String action; // se estiver usando

    @ManyToOne
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;
}
