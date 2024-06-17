package marketplace.nilrow.domain.address;

import lombok.Getter;

@Getter
public enum AddressClassification {

    HOME("home"),
    WORK("work");

    private final String classification;

    AddressClassification(String classification) {
        this.classification = classification;
    }
}
