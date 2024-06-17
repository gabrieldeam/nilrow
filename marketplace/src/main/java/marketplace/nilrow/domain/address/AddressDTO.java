package marketplace.nilrow.domain.address;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AddressDTO {
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
    private AddressType type;
    private String typeName;
    private boolean packagesInLodge;
    private List<String> lodgeDays;
    private boolean lodgeOpen24h;
    private boolean lodgeClosed;
    private String lodgeOpenHour;
    private String lodgeCloseHour;

    public AddressDTO(Address address) {
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
        this.type = address.getType();
        this.typeName = address.getTypeName();
        this.packagesInLodge = address.isPackagesInLodge();
        this.lodgeDays = address.getLodgeDays();
        this.lodgeOpen24h = address.isLodgeOpen24h();
        this.lodgeClosed = address.isLodgeClosed();
        this.lodgeOpenHour = address.getLodgeOpenHour();
        this.lodgeCloseHour = address.getLodgeCloseHour();
    }
}
