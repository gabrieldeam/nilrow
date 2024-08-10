package marketplace.nilrow.domain.catalog;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "time_intervals")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class TimeInterval {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String openTime;  // Formato 'HH:mm'

    @Column(nullable = false)
    private String closeTime; // Formato 'HH:mm'

    @ManyToOne
    @JoinColumn(name = "operating_hours_id", nullable = false)
    private OperatingHours operatingHours;
}
