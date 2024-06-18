package marketplace.nilrow.domain.address;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private String id;
    private String recipientName;
    private String recipientPhone;
    private String cep;
    private String state;
    private String city;
    private String neighborhood;
    private String street;
    private String number;
    private String complement;
    private AddressClassification classification;
    private String moreInformation;

    public AddressDTO(Address address) {
        this.id = address.getId();
        this.recipientName = address.getRecipientName();
        this.recipientPhone = address.getRecipientPhone();
        this.cep = address.getCep();
        this.state = address.getState();
        this.city = address.getCity();
        this.neighborhood = address.getNeighborhood();
        this.street = address.getStreet();
        this.number = address.getNumber();
        this.complement = address.getComplement();
        this.classification = address.getClassification();
        this.moreInformation = address.getMoreInformation();
    }
}
