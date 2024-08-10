package marketplace.nilrow.domain.catalog;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "operating_hours")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class OperatingHours {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String dayOfWeek;

    @Column(nullable = false)
    private boolean is24Hours;

    @Column(nullable = false)
    private boolean isClosed;

    @OneToMany(mappedBy = "operatingHours", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimeInterval> timeIntervals;

    @ManyToOne
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

}
