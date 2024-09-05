package marketplace.nilrow.domain.catalog.location;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "polygons")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Polygon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "polygon_id")
    private List<Coordinate> coordinates;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;
}