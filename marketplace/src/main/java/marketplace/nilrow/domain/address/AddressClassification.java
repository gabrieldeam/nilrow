package marketplace.nilrow.domain.address;

import lombok.Getter;

@Getter
public enum AddressClassification {
    HOME("Casa"),
    WORK("Trabalho");

    private final String classification;

    AddressClassification(String classification) {
        this.classification = classification;
    }
}
