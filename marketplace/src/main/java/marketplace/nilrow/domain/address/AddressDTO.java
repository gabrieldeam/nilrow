package marketplace.nilrow.domain.address;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "É obrigatório")
    private String recipientName;

    @NotBlank(message = "É obrigatório")
    private String recipientPhone;

    @NotBlank(message = "É obrigatório")
    private String cep;

    @NotBlank(message = "É obrigatório")
    private String state;

    @NotBlank(message = "É obrigatório")
    private String city;

    @NotBlank(message = "É obrigatório")
    private String neighborhood;

    @NotBlank(message = "É obrigatório")
    private String street;

    private String number;
    private String complement;

    @NotBlank(message = "É obrigatório")
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
