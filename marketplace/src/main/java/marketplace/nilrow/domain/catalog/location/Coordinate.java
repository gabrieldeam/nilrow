package marketplace.nilrow.domain.catalog.location;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coordinates")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Coordinate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private double latitude;
    private double longitude;

}
