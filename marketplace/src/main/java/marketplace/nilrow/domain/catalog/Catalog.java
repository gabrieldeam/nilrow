package marketplace.nilrow.domain.catalog;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.address.Address;

import java.util.List;

@Entity
@Table(name = "catalogs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Catalog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String nameBoss;

    @Column(nullable = false, unique = true)
    private String cnpj;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @ManyToOne
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @OneToMany(mappedBy = "catalog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OperatingHours> operatingHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OperatingHoursType operatingHoursType;

    @Column(nullable = false)
    private boolean isReleased = false;

    @Column(nullable = false)
    private boolean isVisible = false;
}
