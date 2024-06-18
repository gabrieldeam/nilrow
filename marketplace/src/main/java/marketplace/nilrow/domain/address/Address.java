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

    @Column
    private String complement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressClassification classification;

    @Column
    private String moreInformation;

    @ManyToOne
    @JoinColumn(name = "people_id", nullable = false)
    private People people;

    public Address(String recipientName, String recipientPhone, String cep, String state, String city, String neighborhood, String street, String number, String complement, AddressClassification classification, String moreInformation, People people) {
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
        this.moreInformation = moreInformation;
        this.people = people;
    }
}
