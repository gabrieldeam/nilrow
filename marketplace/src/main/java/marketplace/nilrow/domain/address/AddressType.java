package marketplace.nilrow.domain.address;

import lombok.Getter;

@Getter
public enum AddressType {

    HOUSE("house"),
    CONDO_HOUSE("condo_house"),
    STORE("store"),
    SHOPPING_CENTER_STORE("shopping_center_store"),
    INDUSTRIAL_PARK("industrial_park"),
    BUILDING("building"),
    OTHER("other");

    private final String type;

    AddressType(String type) {
        this.type = type;
    }
}
