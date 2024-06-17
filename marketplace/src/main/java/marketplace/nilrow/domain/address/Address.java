package marketplace.nilrow.domain.address;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.people.People;

import java.util.List;

@Entity
@Table(name = "address")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String recipientPhone;

    @Column(nullable = false)
    private String cep;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String neighborhood;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String number;

    private String complement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressClassification classification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressType type;

    @Column(nullable = false)
    private String typeName;

    @Column(nullable = false)
    private boolean packagesInLodge;

    @ElementCollection
    @CollectionTable(name = "address_lodge_hours", joinColumns = @JoinColumn(name = "address_id"))
    @Column(name = "day")
    private List<String> lodgeDays;

    @Column(nullable = false)
    private boolean lodgeOpen24h;

    @Column(nullable = false)
    private boolean lodgeClosed;

    @Column
    private String lodgeOpenHour;

    @Column
    private String lodgeCloseHour;

    @ManyToOne
    @JoinColumn(name = "people_id", nullable = false)
    private People people;

    public Address(String recipientName, String recipientPhone, String cep, String state, String city, String neighborhood, String street, String number, String complement, AddressClassification classification, AddressType type, String typeName, boolean packagesInLodge, List<String> lodgeDays, boolean lodgeOpen24h, boolean lodgeClosed, String lodgeOpenHour, String lodgeCloseHour, People people) {
        this.recipientName = recipientName;
        this.recipientPhone = recipientPhone;
        this.cep = cep;
        this.state = state;
        this.city = city;
        this.neighborhood = neighborhood;
        this.street = street;
        this.number = number;
        this.complement = complement;
        this.classification = classification;
        this.type = type;
        this.typeName = typeName;
        this.packagesInLodge = packagesInLodge;
        this.lodgeDays = lodgeDays;
        this.lodgeOpen24h = lodgeOpen24h;
        this.lodgeClosed = lodgeClosed;
        this.lodgeOpenHour = lodgeOpenHour;
        this.lodgeCloseHour = lodgeCloseHour;
        this.people = people;
    }
}
